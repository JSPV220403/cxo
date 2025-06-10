const task = require("../models/task.model");
const { Op, fn, col, literal, DOUBLE } = require("sequelize");
const Ticket = require("../models/tickets.model");

const controller = {};

controller.productivity = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const companyId = req.user.workspaceId;


    if (!companyId) {
      return res.status(400).json({ error: "Missing companyId parameter" });
    }

    // Current month start and end
    const monthStart = new Date(year, currentMonth, 1, 0, 0, 0, 0);
    const monthEnd = new Date(year, currentMonth + 1, 0, 23, 59, 59, 999);

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

    // Current month tasks grouped by status
    const statusCounts = await task.findAll({
      where: {
        company_id: companyId,
        created_at: {
          [Op.between]: [monthStart, monthEnd],
        },
      },
      attributes: [
        "status",
        [fn("COUNT", col("*")), "count"],
      ],
      group: ["status"],
    });

    let openCount = 0;
    let completedCount = 0;
    let inProgressCount = 0;

    statusCounts.forEach((row) => {
      if (row.status === "Open") openCount = parseInt(row.dataValues.count);
      if (row.status === "Completed") completedCount = parseInt(row.dataValues.count);
      if (row.status === "In-Progress") inProgressCount = parseInt(row.dataValues.count);
    });

    const overDueTask= await Ticket.count({
      wher:{due_time:'null',
        created_at: {
        [Op.between]: [monthStart, monthEnd],
        },
      },
    })

    // last week calculation
    let lastWeekOpenCount= 0;
    let lastWeekCompletedCount= 0;
    let lastWeekInProgressCount= 0;

    const lastWeekCount= await task.findAll({
      where: {
        company_id: companyId,
        created_at: {
          [Op.between]: [currentWeekStart, currentWeekEnd],
        },
      },
      attributes: [
        "status",
        [fn("COUNT", col("*")), "count"],
      ],
      group: ["status"],
    });

    lastWeekCount.forEach((row) => {
      if (row.status === "Open") lastWeekOpenCount = parseInt(row.dataValues.count);
      if (row.status === "Completed") lastWeekCompletedCount = parseInt(row.dataValues.count);
      if (row.status === "In-Progress") lastWeekInProgressCount = parseInt(row.dataValues.count);
    });

    // current week calculation
    let currWeekOpenCount= 0;
    let currWeekCompletedCount= 0;
    let currWeekInProgressCount= 0;

    const currWeekCount= await task.findAll({
      where: {
        company_id: companyId,
        created_at: {
          [Op.between]: [currentWeekStart, currentWeekEnd],
        },
      },
      attributes: [
        "status",
        [fn("COUNT", col("*")), "count"],
      ],
      group: ["status"],
    });

    currWeekCount.forEach((row) => {
      if (row.status === "Open") currWeekOpenCount = parseInt(row.dataValues.count);
      if (row.status === "Completed") currWeekCompletedCount = parseInt(row.dataValues.count);
      if (row.status === "In-Progress") currWeekInProgressCount = parseInt(row.dataValues.count);
    });

    let openCountCpmarison= lastWeekOpenCount- currWeekOpenCount;
    let completedCountComparison= lastWeekCompletedCount- currWeekCompletedCount
    let inprogressCountComparison= lastWeekInProgressCount- currWeekInProgressCount

    let openStatus;
    if(openCountCpmarison<0){
      openStatus="increase"
    }
    else if(openCountCpmarison>0){
      openStatus="decrease"
    }
    else{
      openStatus="Same"
    }

    let completedStatus;
    if(completedCountComparison<0){
      completedStatus="increase"
    }
    else if(completedCountComparison>0){
      completedStatus="decrease"
    }
    else{
      completedStatus="Same"
    }
    let inprogressStatus; //inprogressCountComparison
    if(inprogressCountComparison<0){
      inprogressStatus="increase"
    }
    else if(inprogressCountComparison>0){
      inprogressStatus="decrease"
    }
    else{
      inprogressStatus="Same"
    }
    const calculatePercentChange = (lastWeekCount, currWeekCount) => {
      if (lastWeekCount === 0 && currWeekCount === 0) {
        return 0; // no change
      }
      if (lastWeekCount === 0) {
        return 100; // cap at 100% for new activity
      }
      const diff = currWeekCount - lastWeekCount;
      const percentChange = (diff / lastWeekCount) * 100;
      // Cap the percent change to avoid unrealistic spikes
      const cappedChange = Math.max(Math.min(Math.round(percentChange), 100), -100);
      return cappedChange;
    };
    
    let openPercent = calculatePercentChange(lastWeekOpenCount, currWeekOpenCount);
    let compPercent = calculatePercentChange(lastWeekCompletedCount, currWeekCompletedCount);
    let inPercent = calculatePercentChange(lastWeekInProgressCount, currWeekInProgressCount);
    


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
          replacements: { monthStart, monthEnd, target:companyId},
          type: task.sequelize.QueryTypes.SELECT,
        }
      );
    } catch (err) {
      console.error("Error fetching top performers:", err);
    }

    // Monthly counts for the year
    const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const monthlyResults = await task.findAll({
      attributes: [
        [fn("MONTH", col("started_at")), "month"],
        [fn("COUNT", "*"), "count"],
      ],
      where: {
        company_id: companyId,
        started_at: {
          [Op.between]: [startOfYear, endOfYear],
        },
      },
      group: [literal("MONTH(started_at)")],
      order: [literal("MONTH(started_at)")],
      raw: true,
    });

    const monthlyCounts = Array.from({ length: 12 }, (_, i) => {
      const found = monthlyResults.find((r) => r.month === i + 1);
      return {
        month: i + 1,
        count: found ? parseInt(found.count) : 0,
      };
    });

    // Optimized weekly counts
    const weeklyResults = await task.findAll({
      attributes: [
        [fn("WEEK", col("created_at"), 1), "week"],
        "status",
        [fn("COUNT", "*"), "count"],
      ],
      where: {
        company_id: companyId,
        created_at: {
          [Op.between]: [startOfYear, endOfYear],
        },
      },
      group: [literal("WEEK(created_at, 1)"), "status"],
      raw: true,
    });

    // Build map week -> status -> count
    const weekStatusMap = {};
    weeklyResults.forEach((row) => {
      const week = parseInt(row.week);
      const status = row.status;
      const count = parseInt(row.count);

      if (!weekStatusMap[week]) {
        weekStatusMap[week] = {
          open: 0,
          completed: 0,
          inProgress: 0,
        };
      }

      if (status === "Open") weekStatusMap[week].open = count;
      else if (status === "Completed") weekStatusMap[week].completed = count;
      else if (status === "In-Progress") weekStatusMap[week].inProgress = count;
    });

    // Build weekly counts (1 to 52)
    const yearStart = new Date(year, 0, 1);
    const weeklyCounts = Array.from({ length: 52 }, (_, i) => {
      const weekNumber = i + 1;

      const weekStart = new Date(yearStart);
      weekStart.setDate(yearStart.getDate() + i * 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const counts = weekStatusMap[weekNumber] || {
        open: 0,
        completed: 0,
        inProgress: 0,
      };

      return {
        week: weekNumber,
        start: weekStart.toISOString().split("T")[0],
        end: weekEnd.toISOString().split("T")[0],
        open: counts.open,
        completed: counts.completed,
        inProgress: counts.inProgress,
      };
    });

    const totalTasks = openCount + completedCount + inProgressCount+ overDueTask;
    const completionRate = totalTasks > 0
      ? Math.round((completedCount / totalTasks) * 100)
      : 0;

    res.json({
      Open_Task: openCount,
      openStatus,
      openPercent,
      Completed: completedCount,
      completedStatus,
      compPercent,
      In_Progress: inProgressCount,
      inprogressStatus,
      inPercent,
      overDueTask,
      Completion_Rate: completionRate,
      Top_Performers: topPerformers,
      Monthly_Counts: monthlyCounts,
      Weekly_Counts: weeklyCounts,
    });
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ error: e.message });
  }
};

module.exports = controller;
