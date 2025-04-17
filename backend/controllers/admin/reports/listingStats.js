const { models, sequelize } = require("../../../models");
const { Op } = require("sequelize");

const listingStats = async ({ month, year }) => {
  try {
    const selectedMonth = parseInt(month) - 1; // 0-indexed
    const selectedYear = parseInt(year);

    const startOfCurrentMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfCurrentMonth = new Date(selectedYear, selectedMonth + 1, 0);

    const startOfPastMonth = new Date(selectedYear, selectedMonth - 1, 1);
    const endOfPastMonth = new Date(selectedYear, selectedMonth, 0);

    // Total Listings in selected month
    const totalListingsCurrentMonth = await models.Listing.count({
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } }
    });

    const totalListingsPastMonth = await models.Listing.count({
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } }
    });

    // Status Counts in selected month
    const statusCountsCurrentMonth = await models.Listing.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("status")), "count"],
      ],
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      group: ["status"],
      raw: true,
    });

    const statusCountsPastMonth = await models.Listing.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("status")), "count"],
      ],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["status"],
      raw: true,
    });

    // Average Rate in selected month
    const avgRateCurrentMonth = await models.Listing.findOne({
      attributes: [[sequelize.fn("AVG", sequelize.col("rate")), "avgRate"]],
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      raw: true,
    });

    const avgRatePastMonth = await models.Listing.findOne({
      attributes: [[sequelize.fn("AVG", sequelize.col("rate")), "avgRate"]],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      raw: true,
    });

    // Category Counts in selected month
    const categoryCountsCurrentMonth = await models.Listing.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("category")), "count"],
      ],
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      group: ["category"],
      raw: true,
    });

    const categoryCountsPastMonth = await models.Listing.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("category")), "count"],
      ],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["category"],
      raw: true,
    });

    // Payment Mode Counts in selected month
    const paymentModeCountsCurrentMonth = await models.Listing.findAll({
      attributes: [
        "payment_mode",
        [sequelize.fn("COUNT", sequelize.col("payment_mode")), "count"],
      ],
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      group: ["payment_mode"],
      raw: true,
    });

    const paymentModeCountsPastMonth = await models.Listing.findAll({
      attributes: [
        "payment_mode",
        [sequelize.fn("COUNT", sequelize.col("payment_mode")), "count"],
      ],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["payment_mode"],
      raw: true,
    });

    return {
      currentMonth: {
        totalListings: totalListingsCurrentMonth,
        statusCounts: statusCountsCurrentMonth,
        avgRate: avgRateCurrentMonth?.avgRate || 0,
        categoryCounts: categoryCountsCurrentMonth,
        paymentModeCounts: paymentModeCountsCurrentMonth,
      },
      pastMonth: {
        totalListings: totalListingsPastMonth,
        statusCounts: statusCountsPastMonth,
        avgRate: avgRatePastMonth?.avgRate || 0,
        categoryCounts: categoryCountsPastMonth,
        paymentModeCounts: paymentModeCountsPastMonth,
      }
    };
  } catch (error) {
    console.error("Error fetching listing stats:", error);
    throw new Error("Failed to fetch listing stats");
  }
};

module.exports = listingStats;
