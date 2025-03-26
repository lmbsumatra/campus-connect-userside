const { Op } = require("sequelize");
const { models, sequelize } = require("../../../models");

const getAuditStats = async () => {
  try {
    const totalActions = await models.AuditLog.count();
    const actionsByType = await models.AuditLog.findAll({
      attributes: [
        "action",
        [sequelize.fn("COUNT", sequelize.col("action")), "count"]
      ],
      group: ["action"],
      order: [["count", "DESC"]],
      raw: true
    });

    const actionsByAdmin = await models.AuditLog.findAll({
      attributes: [
        "admin_id",
        [sequelize.fn("COUNT", sequelize.col("admin_id")), "count"]
      ],
      group: ["admin_id"],
      order: [["count", "DESC"]],
      raw: true
    });

    return { totalActions, actionsByType, actionsByAdmin };
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    throw error;
  }
};

module.exports = getAuditStats;
