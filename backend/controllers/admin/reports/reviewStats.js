
const { Op } = require("sequelize");
const { models } = require("../../../models");

const reviewStats = async () => {
  try {
    const totalReviews = await models.ReviewAndRate.count();

    const averageRating = await models.ReviewAndRate.findOne({
      attributes: [[models.ReviewAndRate.sequelize.fn("AVG", models.ReviewAndRate.sequelize.col("rate")), "avgRating"]],
      raw: true,
    });

    const ratingDistribution = await models.ReviewAndRate.findAll({
      attributes: ["rate", [models.ReviewAndRate.sequelize.fn("COUNT", "rate"), "count"]],
      group: ["rate"],
      raw: true,
    });

    const mostReviewedUsers = await models.ReviewAndRate.findAll({
      attributes: ["reviewee_id", [models.ReviewAndRate.sequelize.fn("COUNT", "reviewee_id"), "reviewCount"]],
      group: ["reviewee_id"],
      order: [[models.ReviewAndRate.sequelize.literal("reviewCount"), "DESC"]],
      limit: 5,
      include: [{ model: models.User, as: "reviewee", attributes: ["user_id", "first_name", "last_name"] }],
      raw: true,
    });

    const mostReviewedItems = await models.ReviewAndRate.findAll({
      attributes: ["item_id", [models.ReviewAndRate.sequelize.fn("COUNT", "item_id"), "reviewCount"]],
      group: ["item_id"],
      order: [[models.ReviewAndRate.sequelize.literal("reviewCount"), "DESC"]],
      limit: 5,
      include: [
        { model: models.Listing, as: "listing", attributes: ["id", "listing_name"] },
        { model: models.ItemForSale, as: "itemforsale", attributes: ["id", "item_for_sale_name"] },
      ],
      raw: true,
    });

    return {
      totalReviews,
      averageRating: parseFloat(averageRating.avgRating).toFixed(2),
      ratingDistribution,
      mostReviewedUsers,
      mostReviewedItems,
    };
  } catch (error) {
    console.error("Error fetching review stats:", error);
    throw new Error("Error fetching review statistics");
  }
};

module.exports = reviewStats;
