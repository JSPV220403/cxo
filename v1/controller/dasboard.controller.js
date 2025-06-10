const tickets = require("../models/tickets.model");
const task = require("../models/task.model");
const { Op } = require("sequelize");

const controller = {};

controller.dashboard = async (req, res) => {
  try {
    const { range } = req.body;
    const companyId = req.user.workspaceId;
    console.log("Company id: "+companyId)


    if (!companyId) {
      return res.status(400).json({ error: "Missing companyId parameter" });
    }

    const now = new Date();
    const pastDate = new Date();
    pastDate.setMonth(now.getMonth() - range);

    // Get P1 tickets count
    let p1Count = 0;
    try {
      p1Count = await tickets.count({
        where: {
          company_id: companyId,
          priority: {
            [Op.in]: [10, 11, 12, 13, 14, 15],
          },
          status: 1,
          created_at: {
            [Op.gte]: pastDate,
          },
        },
      });

    } catch (error) {
      console.error("Error fetching P1 tickets:", error);
      return res.status(500).json({ error: "Failed to fetch P1 tickets" });
    }

    // Calculate average resolution time for tasks in this range
    let averageTime = 0;
    try {
      const tasks = await task.findAll({
        where: {
          priority: {
            [Op.in]: ["Low", "No Priority", "Medium", "High", "Critical"],
          },
          created_at: {
            [Op.gte]: pastDate,
          },
          company_id: companyId,
        },
        attributes: ["started_at", "completed_at"], 
        
      });
    
      let totalHours = 0;
      let completedCount = 0;
    
      tasks.forEach((t) => {
        if (t.started_at && t.completed_at) {
          const start = new Date(t.started_at);
          const end = new Date(t.completed_at);
          const diffInHours = (end - start) / (1000 * 60 * 60);
          totalHours += diffInHours;
          completedCount++;
        }
      });
    
      averageTime = completedCount > 0 ? Math.ceil(totalHours / completedCount) : 0;
    
      // Use or return averageTime as needed
    } catch (error) {
      console.error("Error calculating average resolution time:", error);
      return res.status(500).json({ error: "Failed to calculate average resolution time" });
    }
    
    // Get P1 Source data for customer type ticket counts
    let p1Source = [];
    try {
      p1Source = await tickets.sequelize.query(
        `
        SELECT customer_type, count(*) AS ticket_count
        FROM tickets
        WHERE created_at >= :pastDate AND company_id= :target AND priority IN (10, 11, 12, 13, 14, 15)
        GROUP BY customer_type
        ORDER BY ticket_count DESC
        LIMIT 1
        `,
        {
          replacements: { pastDate, target: companyId },
          type: tickets.sequelize.QueryTypes.SELECT,
        }
      );
    } catch (error) {
      console.error("Error fetching P1 source data:", error);
      return res.status(500).json({ error: "Failed to fetch P1 source data" });
    }

    // Send final response
    res.json({
      P1: p1Count,
      averageTime,
      p1Source,
    });
  } catch (e) {
    console.error("Error in dashboard controller:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = controller;
