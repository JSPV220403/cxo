const ticket = require("../models/tickets.model");
const task = require("../models/task.model");
const { Op } = require("sequelize");

const controller = {};

controller.process = async (req, res) => {
  const company_id = req.user.workspaceId;


  let monthStart, monthEnd;
  const now = new Date();
  monthStart =new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;

  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - diffToMonday);
  currentWeekStart.setHours(0, 0, 0, 0);

  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
  currentWeekEnd.setHours(23, 59, 59, 999);

  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(currentWeekStart.getDate() - 7);
  lastWeekStart.setHours(0, 0, 0, 0);

  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
  lastWeekEnd.setHours(23, 59, 59, 999);

  try {
    // P1 count
    const p1 = await ticket.count({
      where: {
        priority: { [Op.in]: [10, 11, 12, 13, 14, 15] },
        created_at: { [Op.between]: [monthStart, monthEnd] },
        status: 1,
      },
    });

    // Average resolution time for tasks
    let averageTime = 0;
    
    let lastaverageTime = 0;
    let curraverageTime = 0;

    try {
      const avgTimeTasks = await task.findAll({
        where: {
          priority: { [Op.in]: ["Low", "No Priority", "Medium", "High", "Critical"] },
          created_at: { [Op.between]: [monthStart, monthEnd] },
        },
      });

      let totalHours = 0;
      let completedCount = 0;

      avgTimeTasks.forEach((task) => {
        if (task.started_at && task.completed_at) {
          const start = new Date(task.started_at);
          const end = new Date(task.completed_at);
          const diffInMs = end - start;
          const diffInHours = diffInMs / (1000 * 60 * 60);
          totalHours += diffInHours;
          completedCount++;
        }
      });

      averageTime = completedCount > 0 ? Math.ceil(totalHours / completedCount) : 0;

      // lastWeek calculation
      const lastWeek = await task.findAll({
        where: {
          priority: { [Op.in]: ["Low", "No Priority", "Medium", "High", "Critical"] },
          created_at: { [Op.between]: [lastWeekStart, lastWeekEnd] },
        },
      });

      let lasttotalHours = 0;
      let lastcompletedCount = 0;

      lastWeek.forEach((task) => {
        if (task.started_at && task.completed_at) {
          const start = new Date(task.started_at);
          const end = new Date(task.completed_at);
          const diffInMs = end - start;
          const diffInHours = diffInMs / (1000 * 60 * 60);
          lasttotalHours += diffInHours;
          lastcompletedCount++;
        }
      });

      lastaverageTime = lastcompletedCount > 0 ? Math.ceil(lasttotalHours / lastcompletedCount) : 0;

      // current week
      const currWeek = await task.findAll({
        where: {
          priority: { [Op.in]: ["Low", "No Priority", "Medium", "High", "Critical"] },
          created_at: { [Op.between]: [currentWeekStart, currentWeekEnd] }, // FIXED: was using lastWeek dates
        },
      });

      let currtotalHours = 0;
      let currcompletedCount = 0;

      currWeek.forEach((task) => {
        if (task.started_at && task.completed_at) {
          const start = new Date(task.started_at);
          const end = new Date(task.completed_at);
          const diffInMs = end - start;
          const diffInHours = diffInMs / (1000 * 60 * 60);
          currtotalHours += diffInHours;
          currcompletedCount++;
        }
      });

      curraverageTime = currcompletedCount > 0 ? Math.ceil(currtotalHours / currcompletedCount) : 0;

    } catch (err) {
      console.error("Error in calculating average time:", err);
    }

    // Calculate percentage change of average resolution time between this week and last week
    const averageTimeChangePercent =
      lastaverageTime === 0
        ? curraverageTime > 0
          ? 100
          : 0
        : ((curraverageTime - lastaverageTime) / lastaverageTime) * 100;

    // Customer type names
    const customerTypeNames = {
      20: "Paid Customer",
      21: "VIP Customer",
      22: "Platinum Customer",
      23: "Elite Customer",
      24: "Gold Member",
      25: "Silver Member",
      26: "Regular Member",
      27: "New Customer",
      28: "Trial User",
      29: "Free User",
    };
    const customerTypes = Object.keys(customerTypeNames).map(Number);

    // Raw SQL for customer type ticket counts
    let p1Source = [];
    try {
      p1Source = await ticket.sequelize.query(
        `
        SELECT customer_type, count(*) AS ticket_count
        FROM tickets
        WHERE created_at BETWEEN :startDate AND :endDate AND company_id AND priority IN (10, 11, 12, 13, 14, 15)
        GROUP BY customer_type LIMIT 1
        `,
        {
          replacements: { startDate: monthStart, endDate: monthEnd},
          type: ticket.sequelize.QueryTypes.SELECT,
        }
      );
    } catch (err) {
      console.error("Error fetching p1Source:", err);
    }

    // Build a mapping of counts from p1Source
    const countsMap = {};
    p1Source.forEach((row) => {
      countsMap[row.customer_type] = Number(row.ticket_count);
    });

    // Customer-specific stats with new % open issues
    const customerStats = [];
    for (const type of customerTypes) {
      try {
        const ticketsList = await ticket.findAll({
          where: {
            customer_type: type,
            created_at: { [Op.between]: [monthStart, monthEnd] },
            company_id: company_id,
          },
        });

        let totalResolutionHours = 0;
        let count = 0;

        let totalIssues = ticketsList.length;
        let openIssues = 0;

        for (const t of ticketsList) {
          if (t.task_status === "Open") {
            openIssues++;
          }

          const taskId = t.task_id;
          if (taskId) {
            const taskDetails = await task.findOne({
              where: {
                id: taskId,
                created_at: { [Op.between]: [monthStart, monthEnd] },
              },
              attributes: ["started_at", "completed_at"],
            });

            if (taskDetails && taskDetails.started_at && taskDetails.completed_at) {
              const start = new Date(taskDetails.started_at);
              const end = new Date(taskDetails.completed_at);
              const diffInHours = (end - start) / (1000 * 60 * 60);
              totalResolutionHours += diffInHours;
              count++;
            }
          }
        }

        const avgResolutionTime = count > 0 ? totalResolutionHours / count : 0;
        const openIssuesPercent = totalIssues > 0 ? (openIssues / totalIssues) * 100 : 0;

        customerStats.push({
          customerType: customerTypeNames[type],
          issuesCount: countsMap[type] || 0,
          avgResolutionTime: Number(avgResolutionTime.toFixed(2)),
          openIssuesPercent: Number(openIssuesPercent.toFixed(2)),
        });
      } catch (err) {
        console.error(`Error for customer type ${type}:`, err);
      }
    }

    // Top performers
    let topPerformers = [];
    try {
      topPerformers = await task.sequelize.query(
        `
        SELECT assigned_to, COUNT(*) AS completed_count
        FROM tasks
        WHERE company_id= :target
          AND status = 'Completed'
          AND completed_at BETWEEN :monthStart AND :monthEnd
        GROUP BY assigned_to
        ORDER BY completed_count DESC
        `,
        {
          replacements: { monthStart, monthEnd, target:company_id },
          type: task.sequelize.QueryTypes.SELECT,
        }
      );
    } catch (err) {
      console.error("Error fetching top performers:", err);
    }

    // Recent tickets
    let recentTickets = [];
    try {
      recentTickets = await ticket.findAll({
        where: {
          created_at: { [Op.between]: [monthStart, monthEnd] },
        },
        limit: 5,
      });
    } catch (err) {
      console.error("Error fetching recent tickets:", err);
    }

    res.json({
      P1: p1,
      p1Source,
      averageTime,
      averageTimeChangePercent: Number(averageTimeChangePercent.toFixed(2)),
      customerStats,
      topPerformers,
      recentTickets,
    });
  } catch (e) {
    console.error("Unexpected error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = controller;
