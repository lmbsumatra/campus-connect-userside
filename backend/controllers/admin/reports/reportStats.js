const { Op, Sequelize } = require("sequelize");
const { models } = require("../../../models");

const reportStats = async ({ month, year }) => {
  try {
    const selectedMonth = parseInt(month) - 1; // 0-indexed
    const selectedYear = parseInt(year);

    const startOfCurrentMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfCurrentMonth = new Date(selectedYear, selectedMonth + 1, 0);

    const startOfPastMonth = new Date(selectedYear, selectedMonth - 1, 1);
    const endOfPastMonth = new Date(selectedYear, selectedMonth, 0);

    // Total Reports
    const totalReportsCurrentMonth = await models.Report.count({
      where: { createdAt: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } }
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
      where: { createdAt: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
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
      where: { createdAt: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
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
        createdAt: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], }
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
