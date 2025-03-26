const { models, sequelize } = require("../../../models");


const listingStats = async () => {
  try {
    const totalListings = await models.Listing.count();

    const statusCounts = await models.Listing.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("status")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    const avgRate = await models.Listing.findOne({
      attributes: [[sequelize.fn("AVG", sequelize.col("rate")), "avgRate"]],
      raw: true,
    });

    const categoryCounts = await models.Listing.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("category")), "count"],
      ],
      group: ["category"],
      raw: true,
    });

    const paymentModeCounts = await models.Listing.findAll({
      attributes: [
        "payment_mode",
        [sequelize.fn("COUNT", sequelize.col("payment_mode")), "count"],
      ],
      group: ["payment_mode"],
      raw: true,
    });

    return {
      totalListings,
      statusCounts,
      avgRate: avgRate.avgRate || 0,
      categoryCounts,
      paymentModeCounts,
    };
  } catch (error) {
    console.error("Error fetching listing stats:", error);
    throw new Error("Failed to fetch listing stats");
  }
};

module.exports = listingStats;
