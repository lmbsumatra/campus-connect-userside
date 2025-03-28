const { Op, Sequelize } = require("sequelize");
const { models } = require("../../../models");

const transactionReportStats = async () => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of the previous month

    // Total transaction reports
    const totalReportsCurrentMonth = await models.TransactionReport.count({
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } }
    });

    const totalReportsPastMonth = await models.TransactionReport.count({
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } }
    });

    // Reports grouped by transaction type
    const reportsByTypeCurrentMonth = await models.TransactionReport.findAll({
      attributes: [
        "transaction_type",
        [Sequelize.fn("COUNT", Sequelize.col("transaction_type")), "count"],
      ],
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } },
      group: ["transaction_type"],
      raw: true,
    });

    const reportsByTypePastMonth = await models.TransactionReport.findAll({
      attributes: [
        "transaction_type",
        [Sequelize.fn("COUNT", Sequelize.col("transaction_type")), "count"],
      ],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["transaction_type"],
      raw: true,
    });

    // Report status distribution
    const reportStatusDistributionCurrentMonth = await models.TransactionReport.findAll({
      attributes: [
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("status")), "count"],
      ],
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } },
      group: ["status"],
      raw: true,
    });

    const reportStatusDistributionPastMonth = await models.TransactionReport.findAll({
      attributes: [
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("status")), "count"],
      ],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["status"],
      raw: true,
    });

    // Most reported users (default: top 5)
    const mostReportedUsersCurrentMonth = await models.TransactionReport.findAll({
      attributes: [
        "reported_id",
        [Sequelize.fn("COUNT", Sequelize.col("reported_id")), "count"],
      ],
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } },
      group: ["reported_id"],
      order: [[Sequelize.literal("count"), "DESC"]],
      limit: 5,
      raw: true,
    });

    const mostReportedUsersPastMonth = await models.TransactionReport.findAll({
      attributes: [
        "reported_id",
        [Sequelize.fn("COUNT", Sequelize.col("reported_id")), "count"],
      ],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["reported_id"],
      order: [[Sequelize.literal("count"), "DESC"]],
      limit: 5,
      raw: true,
    });

    // Average resolution time in hours
    const averageResolutionTimeCurrentMonth = await models.TransactionReport.findAll({
      attributes: [
        [
          Sequelize.fn(
            "AVG",
            Sequelize.literal("TIMESTAMPDIFF(HOUR, createdAt, updatedAt)")
          ),
          "avg_resolution_time_hours",
        ],
      ],
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } },
      raw: true,
    });

    const averageResolutionTimePastMonth = await models.TransactionReport.findAll({
      attributes: [
        [
          Sequelize.fn(
            "AVG",
            Sequelize.literal("TIMESTAMPDIFF(HOUR, createdAt, updatedAt)")
          ),
          "avg_resolution_time_hours",
        ],
      ],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      raw: true,
    });

    // Response rate percentage
    const totalRespondedReportsCurrentMonth = await models.TransactionReport.count({
      where: {
        createdAt: { [Op.gte]: startOfCurrentMonth },
        response_description: { [Op.not]: null },
      },
    });

    const totalRespondedReportsPastMonth = await models.TransactionReport.count({
      where: {
        createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] },
        response_description: { [Op.not]: null },
      },
    });

    const responseRateCurrentMonth = totalReportsCurrentMonth > 0 ? (totalRespondedReportsCurrentMonth / totalReportsCurrentMonth) * 100 : 0;
    const responseRatePastMonth = totalReportsPastMonth > 0 ? (totalRespondedReportsPastMonth / totalReportsPastMonth) * 100 : 0;

    return {
      currentMonth: {
        totalReports: totalReportsCurrentMonth,
        reportsByType: reportsByTypeCurrentMonth,
        reportStatusDistribution: reportStatusDistributionCurrentMonth,
        mostReportedUsers: mostReportedUsersCurrentMonth,
        averageResolutionTime: averageResolutionTimeCurrentMonth[0]?.avg_resolution_time_hours || 0,
        responseRate: responseRateCurrentMonth.toFixed(2),
      },
      pastMonth: {
        totalReports: totalReportsPastMonth,
        reportsByType: reportsByTypePastMonth,
        reportStatusDistribution: reportStatusDistributionPastMonth,
        mostReportedUsers: mostReportedUsersPastMonth,
        averageResolutionTime: averageResolutionTimePastMonth[0]?.avg_resolution_time_hours || 0,
        responseRate: responseRatePastMonth.toFixed(2),
      }
    };
  } catch (error) {
    console.error("Error fetching transaction report statistics:", error);
    throw error;
  }
};

module.exports = transactionReportStats;
