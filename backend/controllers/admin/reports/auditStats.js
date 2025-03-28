const { Op } = require("sequelize");
const { models, sequelize } = require("../../../models");

const getAuditStats = async () => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of the previous month

    const totalActions = await models.AuditLog.count();

    const actionsByType = await models.AuditLog.findAll({
      attributes: [
        "action",
        [sequelize.fn("COUNT", sequelize.col("action")), "count"]
      ],
      where: {
        createdAt: {
          [Op.gte]: startOfCurrentMonth
        }
      },
      group: ["action"],
      order: [["count", "DESC"]],
      raw: true
    });

    const actionsByAdmin = await models.AuditLog.findAll({
      attributes: [
        "admin_id",
        [sequelize.fn("COUNT", sequelize.col("admin_id")), "count"]
      ],
      where: {
        createdAt: {
          [Op.gte]: startOfCurrentMonth
        }
      },
      group: ["admin_id"],
      order: [["count", "DESC"]],
      raw: true
    });

    const actionsLastMonth = await models.AuditLog.findAll({
      attributes: [
        "action",
        [sequelize.fn("COUNT", sequelize.col("action")), "count"]
      ],
      where: {
        createdAt: {
          [Op.between]: [startOfPastMonth, endOfPastMonth]
        }
      },
      group: ["action"],
      order: [["count", "DESC"]],
      raw: true
    });

    return { 
      totalActions, 
      actionsByType, 
      actionsByAdmin, 
      actionsLastMonth 
    };
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    throw error;
  }
};

module.exports = getAuditStats;
