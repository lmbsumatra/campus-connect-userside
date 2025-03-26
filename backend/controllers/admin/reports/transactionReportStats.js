const { Op, Sequelize } = require("sequelize");
const { models } = require("../../../models");

const transactionReportStats = async () => {
  try {
    // Total transaction reports
    const totalReports = await models.TransactionReport.count();

    // Reports grouped by transaction type
    const reportsByType = await models.TransactionReport.findAll({
      attributes: [
        "transaction_type",
        [Sequelize.fn("COUNT", Sequelize.col("transaction_type")), "count"],
      ],
      group: ["transaction_type"],
      raw: true,
    });

    // Report status distribution
    const reportStatusDistribution = await models.TransactionReport.findAll({
      attributes: [
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("status")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    // Reports over time (default: daily)
    const reportsOverTime = async (interval = "day") => {
      return await models.TransactionReport.findAll({
        attributes: [
          [
            Sequelize.fn(
              "DATE_FORMAT",
              Sequelize.col("createdAt"),
              interval === "day" ? "%Y-%m-%d" : "%Y-%m"
            ),
            "date",
          ],
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["date"],
        order: [["date", "ASC"]],
        raw: true,
      });
    };

    // Most reported users (default: top 5)
    const mostReportedUsers = await models.TransactionReport.findAll({
      attributes: [
        "reported_id",
        [Sequelize.fn("COUNT", Sequelize.col("reported_id")), "count"],
      ],
      group: ["reported_id"],
      order: [[Sequelize.literal("count"), "DESC"]],
      limit: 5,
      raw: true,
    });

    // Average resolution time in hours
    const averageResolutionTime = await models.TransactionReport.findAll({
      attributes: [
        [
          Sequelize.fn(
            "AVG",
            Sequelize.literal("TIMESTAMPDIFF(HOUR, createdAt, updatedAt)")
          ),
          "avg_resolution_time_hours",
        ],
      ],
      raw: true,
    });

    // Response rate percentage
    const totalRespondedReports = await models.TransactionReport.count({
      where: {
        response_description: { [Op.not]: null },
      },
    });

    const responseRate = totalReports > 0 ? (totalRespondedReports / totalReports) * 100 : 0;

    return {
      totalReports,
      reportsByType,
      reportStatusDistribution,
      reportsOverTime,
      mostReportedUsers,
      averageResolutionTime: averageResolutionTime[0]?.avg_resolution_time_hours || 0,
      responseRate: responseRate.toFixed(2),
    };
  } catch (error) {
    console.error("Error fetching transaction report statistics:", error);
    throw error;
  }
};

module.exports = transactionReportStats;
