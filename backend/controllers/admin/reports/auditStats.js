const { Op } = require("sequelize");
const { models, sequelize } = require("../../../models");

const getAuditStats = async ({ month, year }) => {
  try {
    const selectedMonth = parseInt(month) - 1; // JS Date months are 0-indexed
    const selectedYear = parseInt(year);

    // Current month range
    const startOfCurrentMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfCurrentMonth = new Date(selectedYear, selectedMonth + 1, 0);

    // Previous month range
    const startOfPastMonth = new Date(selectedYear, selectedMonth - 1, 1);
    const endOfPastMonth = new Date(selectedYear, selectedMonth, 0);

    const totalActions = await models.AuditLog.count({
      where: {
        createdAt: {
          [Op.between]: [startOfCurrentMonth, endOfCurrentMonth],
        },
      },
    });

    const actionsByType = await models.AuditLog.findAll({
      attributes: [
        "action",
        [sequelize.fn("COUNT", sequelize.col("action")), "count"],
      ],
      where: {
        createdAt: {
          [Op.between]: [startOfCurrentMonth, endOfCurrentMonth],
        },
      },
      group: ["action"],
      order: [["count", "DESC"]],
      raw: true,
    });

    const actionsByAdmin = await models.AuditLog.findAll({
      attributes: [
        "admin_id",
        [sequelize.fn("COUNT", sequelize.col("admin_id")), "count"],
      ],
      where: {
        createdAt: {
          [Op.between]: [startOfCurrentMonth, endOfCurrentMonth],
        },
      },
      group: ["admin_id"],
      order: [["count", "DESC"]],
      raw: true,
    });

    const actionsLastMonth = await models.AuditLog.findAll({
      attributes: [
        "action",
        [sequelize.fn("COUNT", sequelize.col("action")), "count"],
      ],
      where: {
        createdAt: {
          [Op.between]: [startOfPastMonth, endOfPastMonth],
        },
      },
      group: ["action"],
      order: [["count", "DESC"]],
      raw: true,
    });


    return {
      totalActions,
      actionsByType,
      actionsByAdmin,
      actionsLastMonth,
    };
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    throw error;
  }
};

module.exports = getAuditStats;
