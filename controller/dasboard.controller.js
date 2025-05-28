const tickets = require("../models/tickets.model");
const task = require("../models/task.model");
const { Op } = require("sequelize");

const controller = {};

controller.dashboard = async (req, res) => {
  try {
    const { range } = req.body;
    const companyId = 9742398; // Example company_id

    if (!companyId) {
      return res.status(400).json({ error: "Missing companyId parameter" });
    }

    const now = new Date();
    const pastDate = new Date();
    pastDate.setMonth(now.getMonth() - range);

    // P1 tickets count
    const p1 = await tickets.findAll({
      where: {
        company_id: companyId,
        priority: {
          [Op.in]: [10, 11, 12, 13, 14, 15],
        },
        task_status:'Open',
        created_at: {
          [Op.gte]: pastDate,
        },
      },
    });

    // Average resolution time for tasks in this range
    const avgTimeTasks = await task.findAll({
      where: {
        priority: {
          [Op.in]: ["Low", "No Priority", "Medium", "High", "Critical"],
        },
        created_at: {
          [Op.gte]: pastDate,
        },
        company_id:companyId
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

    const averageTime = completedCount > 0 ? Math.ceil(totalHours / completedCount) : 0;

    // P1 Source data for customer type ticket counts
    const p1Source = await tickets.sequelize.query(
      `
      SELECT customer_type, count(*) AS ticket_count
      FROM tickets
      WHERE created_at >= :pastDate AND company_id= :target AND task_status='Open'
      GROUP BY customer_type
      ORDER BY ticket_count DESC
      LIMIT 1
      `,
      {
        replacements: {
          pastDate,
          target: companyId,
        },
        type: tickets.sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      P1: p1.length,
      averageTime,
      p1Source,
    });
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ error: e.message });
  }
};

module.exports = controller;
