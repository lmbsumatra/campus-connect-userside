const { models, sequelize } = require("../../../models");
const { Op } = require("sequelize");

const listingStats = async () => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of the previous month

    // Total Listings
    const totalListingsCurrentMonth = await models.Listing.count({
      where: { created_at: { [Op.gte]: startOfCurrentMonth } }
    });

    const totalListingsPastMonth = await models.Listing.count({
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } }
    });

    // Status Counts
    const statusCountsCurrentMonth = await models.Listing.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("status")), "count"],
      ],
      where: { created_at: { [Op.gte]: startOfCurrentMonth } },
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

    // Average Rate
    const avgRateCurrentMonth = await models.Listing.findOne({
      attributes: [[sequelize.fn("AVG", sequelize.col("rate")), "avgRate"]],
      where: { created_at: { [Op.gte]: startOfCurrentMonth } },
      raw: true,
    });

    const avgRatePastMonth = await models.Listing.findOne({
      attributes: [[sequelize.fn("AVG", sequelize.col("rate")), "avgRate"]],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      raw: true,
    });

    // Category Counts
    const categoryCountsCurrentMonth = await models.Listing.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("category")), "count"],
      ],
      where: { created_at: { [Op.gte]: startOfCurrentMonth } },
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

    // Payment Mode Counts
    const paymentModeCountsCurrentMonth = await models.Listing.findAll({
      attributes: [
        "payment_mode",
        [sequelize.fn("COUNT", sequelize.col("payment_mode")), "count"],
      ],
      where: { created_at: { [Op.gte]: startOfCurrentMonth } },
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
