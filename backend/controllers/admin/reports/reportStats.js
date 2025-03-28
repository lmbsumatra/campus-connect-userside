const { Op, Sequelize } = require("sequelize");
const { models } = require("../../../models");

const reportStats = async () => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of the previous month

    // Total Reports
    const totalReportsCurrentMonth = await models.Report.count({
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } }
    });

    const totalReportsPastMonth = await models.Report.count({
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } }
    });

    // Reports by Entity Type
    const reportsByEntityTypeCurrentMonth = await models.Report.findAll({
      attributes: [
        "entity_type",
        [Sequelize.fn("COUNT", "*"), "count"],
      ],
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } },
      group: ["entity_type"],
      raw: true,
    });

    const reportsByEntityTypePastMonth = await models.Report.findAll({
      attributes: [
        "entity_type",
        [Sequelize.fn("COUNT", "*"), "count"],
      ],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["entity_type"],
      raw: true,
    });

    // Reports by Status
    const reportsByStatusCurrentMonth = await models.Report.findAll({
      attributes: [
        "status",
        [Sequelize.fn("COUNT", "*"), "count"],
      ],
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } },
      group: ["status"],
      raw: true,
    });

    const reportsByStatusPastMonth = await models.Report.findAll({
      attributes: [
        "status",
        [Sequelize.fn("COUNT", "*"), "count"],
      ],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["status"],
      raw: true,
    });

    // Disputes Count
    const disputesCountCurrentMonth = await models.Report.count({
      where: { 
        is_dispute: true,
        createdAt: { [Op.gte]: startOfCurrentMonth }
      },
    });

    const disputesCountPastMonth = await models.Report.count({
      where: { 
        is_dispute: true,
        createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] }
      },
    });

    return {
      currentMonth: {
        totalReports: totalReportsCurrentMonth,
        reportsByEntityType: reportsByEntityTypeCurrentMonth,
        reportsByStatus: reportsByStatusCurrentMonth,
        disputesCount: disputesCountCurrentMonth,
      },
      pastMonth: {
        totalReports: totalReportsPastMonth,
        reportsByEntityType: reportsByEntityTypePastMonth,
        reportsByStatus: reportsByStatusPastMonth,
        disputesCount: disputesCountPastMonth,
      }
    };
  } catch (error) {
    console.error("Error fetching report statistics:", error);
    throw error;
  }
};

module.exports = reportStats;
