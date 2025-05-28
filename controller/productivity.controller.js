const task = require("../models/task.model");
const { Op } = require("sequelize");

const controller = {};

controller.productivity = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const currentMonth = now.getMonth();
    const companyId = 9742398; // Or: req?.user?.user_id

    if (!companyId) {
      return res.status(400).json({ error: "Missing companyId parameter" });
    }

    // Current month start and end
    const monthStart = new Date(year, currentMonth, 1, 0, 0, 0, 0);
    const monthEnd = new Date(year, currentMonth + 1, 0, 23, 59, 59, 999);

    // Current month tasks
    const open = await task.findAll({
      where: {
        company_id: companyId,
        status: "Open",
        created_at: {
          [Op.between]: [monthStart, monthEnd],
        },
      },
    });

    const completed = await task.findAll({
      where: {
        company_id: companyId,
        status: "Completed",
        created_at: {
          [Op.between]: [monthStart, monthEnd],
        },
      },
    });

    const inprogress = await task.findAll({
      where: {
        company_id: companyId,
        status: "In-Progress",
        created_at: {
          [Op.between]: [monthStart, monthEnd],
        },
      },
    });

    // Top performers
    const topPerformers = await task.sequelize.query(
      `
      SELECT assigned_to, COUNT(*) AS completed_count
      FROM tasks
      WHERE company_id = :companyId
        AND status = 'Completed'
        AND started_at BETWEEN :monthStart AND :monthEnd
      GROUP BY assigned_to
      ORDER BY completed_count DESC
      `,
      {
        replacements: {
          companyId,
          monthStart,
          monthEnd,
        },
        type: task.sequelize.QueryTypes.SELECT,
      }
    );

    // Monthly counts for the year
    const monthlyCounts = [];
    for (let month = 0; month < 12; month++) {
      const mStart = new Date(year, month, 1, 0, 0, 0, 0);
      const mEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const count = await task.count({
        where: {
          company_id: companyId,
          started_at: {
            [Op.between]: [mStart, mEnd],
          },
        },
      });

      monthlyCounts.push({
        month: month + 1,
        count,
      });
    }

    // Weekly counts for 52 weeks
    const yearStart = new Date(year, 0, 1);
    const weeklyCounts = [];

    for (let week = 0; week < 52; week++) {
      const weekStart = new Date(yearStart);
      weekStart.setDate(yearStart.getDate() + week * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const openCount = await task.count({
        where: {
          company_id: companyId,
          status: "Open",
          created_at: {
            [Op.between]: [weekStart, weekEnd],
          },
        },
      });

      const completedCount = await task.count({
        where: {
          company_id: companyId,
          status: "Completed",
          created_at: {
            [Op.between]: [weekStart, weekEnd],
          },
        },
      });

      const inProgressCount = await task.count({
        where: {
          company_id: companyId,
          status: "In-Progress",
          created_at: {
            [Op.between]: [weekStart, weekEnd],
          },
        },
      });

      weeklyCounts.push({
        week: week + 1,
        start: weekStart.toISOString().split("T")[0],
        end: weekEnd.toISOString().split("T")[0],
        open: openCount,
        completed: completedCount,
        inProgress: inProgressCount,
      });
    }

    const totalTasks = open.length + completed.length + inprogress.length;
    const completionRate =
      totalTasks > 0 ? Math.round((completed.length / totalTasks) * 100) : 0;

    res.json({
      Open_Task: open.length,
      Completed: completed.length,
      In_Progress: inprogress.length,
      Completion_Rate: completionRate,
      Top_Performers: topPerformers,
      Monthly_Counts: monthlyCounts,
      Weekly_Counts: weeklyCounts, // Newly added
    });
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ error: e.message });
  }
};

module.exports = controller;
