const ticket = require("../models/tickets.model");
const task = require("../models/task.model");
const { Op } = require("sequelize");

const controller = {};

controller.process = async (req, res) => {
  try {
    const company_id = 9742398;

    // Get optional startMonth and endMonth from query
    const { startMonth, endMonth } = req.query;
    let monthStart, monthEnd;

    if (startMonth && endMonth) {
      const [startYear, startMon] = startMonth.split("-").map(Number);
      const [endYear, endMon] = endMonth.split("-").map(Number);

      monthStart = new Date(startYear, startMon - 1, 1, 0, 0, 0, 0);
      monthEnd = new Date(endYear, endMon, 0, 23, 59, 59, 999);
    } else {
      // Default to current month
      const now = new Date();
      monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // P1 count
    const p1 = await ticket.count({
      where: {
        priority: { [Op.in]: [10, 11, 12, 13, 14, 15] },
        created_at: { [Op.between]: [monthStart, monthEnd] },
        task_status:'Open'
      },
    });

    // Average resolution time for tasks in general
    const avgTimeTasks = await task.findAll({
      where: {
        priority: { [Op.in]: ["Low", "No Priority", "Medium", "High", "Critical"] },
        created_at: { [Op.between]: [monthStart, monthEnd] },
      },
    });

    let totalHours = 0;
    let completedCount = 0;

    avgTimeTasks.forEach(task => {
      if (task.started_at && task.completed_at) {
        const start = new Date(task.started_at);
        const end = new Date(task.completed_at);
        const diffInMs = end - start;
        const diffInHours = diffInMs / (1000 * 60 * 60);
        totalHours += diffInHours;
        completedCount++;
      }
    });

    const averageTime = completedCount > 0 ? Math.ceil(totalHours / completedCount) : 0;

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
    const p1Source = await ticket.sequelize.query(
      `
      SELECT customer_type, count(*) AS ticket_count
      FROM tickets
      WHERE created_at BETWEEN :startDate AND :endDate AND company_id= :target AND task_status='Open'
      GROUP BY customer_type limit 1
      `,
      {
        replacements: { startDate: monthStart, endDate: monthEnd, target: company_id },
        type: ticket.sequelize.QueryTypes.SELECT,
      }
    );

    // Build a mapping of counts from p1Source
    const countsMap = {};
    p1Source.forEach(row => {
      countsMap[row.customer_type] = Number(row.ticket_count);
    });

    // Prepare final output array
    const customerStats = [];

    for (const type of customerTypes) {
      // Get all tickets for this customer type within the selected month range
      const tickets = await ticket.findAll({
        where: {
          customer_type: type,
          created_at: { [Op.between]: [monthStart, monthEnd] },
          company_id: company_id,
        },
      });

      let totalResolutionHours = 0;
      let count = 0;

      for (const t of tickets) {
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

      customerStats.push({
        customerType: customerTypeNames[type],
        issuesCount: countsMap[type] || 0,
        avgResolutionTime: Number(avgResolutionTime.toFixed(2)),
      });
    }
    const topPerformers = await task.sequelize.query(
      `
      SELECT assigned_to, COUNT(*) AS completed_count
      FROM tasks
      WHERE company_ids
        AND status = 'Completed'
        AND started_at BETWEEN :monthStart AND :monthEnd
      GROUP BY assigned_to
      ORDER BY completed_count DESC
      `,
      {
        replacements: {
          monthStart,
          monthEnd,
        },
        type: task.sequelize.QueryTypes.SELECT,
      }
    );
    const recentTickets = await ticket.findAll({
      where: {
        created_at: {
          [Op.between]: [monthStart, monthEnd],
        },
      },
      limit: 5,
    });
    
    res.json({
      P1: p1,
      p1Source,
      averageTime,
      customerStats,
      topPerformers,
      recentTickets
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = controller;
