const { Op, Sequelize } = require("sequelize");
const { models } = require("../../../models");

const reviewStats = async ({ month, year }) => {
  try {
    const selectedMonth = parseInt(month) - 1; // 0-indexed
    const selectedYear = parseInt(year);

    const startOfCurrentMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfCurrentMonth = new Date(selectedYear, selectedMonth + 1, 0);

    const startOfPastMonth = new Date(selectedYear, selectedMonth - 1, 1);
    const endOfPastMonth = new Date(selectedYear, selectedMonth, 0);

    // Total Reviews
    const totalReviewsCurrentMonth = await models.ReviewAndRate.count({
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } }
    });

    const totalReviewsPastMonth = await models.ReviewAndRate.count({
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } }
    });

    // Average Rating
    const averageRatingCurrentMonth = await models.ReviewAndRate.findOne({
      attributes: [[Sequelize.fn("AVG", Sequelize.col("rate")), "avgRating"]],
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      raw: true,
    });

    const averageRatingPastMonth = await models.ReviewAndRate.findOne({
      attributes: [[Sequelize.fn("AVG", Sequelize.col("rate")), "avgRating"]],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      raw: true,
    });

    // Rating Distribution
    const ratingDistributionCurrentMonth = await models.ReviewAndRate.findAll({
      attributes: ["rate", [Sequelize.fn("COUNT", "rate"), "count"]],
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      group: ["rate"],
      raw: true,
    });

    const ratingDistributionPastMonth = await models.ReviewAndRate.findAll({
      attributes: ["rate", [Sequelize.fn("COUNT", "rate"), "count"]],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["rate"],
      raw: true,
    });

    return {
      currentMonth: {
        totalReviews: totalReviewsCurrentMonth,
        averageRating: parseFloat(averageRatingCurrentMonth?.avgRating || 0).toFixed(2),
        ratingDistribution: ratingDistributionCurrentMonth,
      },
      pastMonth: {
        totalReviews: totalReviewsPastMonth,
        averageRating: parseFloat(averageRatingPastMonth?.avgRating || 0).toFixed(2),
        ratingDistribution: ratingDistributionPastMonth,
      }
    };
  } catch (error) {
    console.error("Error fetching review stats:", error);
    throw new Error("Error fetching review statistics");
  }
};

module.exports = reviewStats;
