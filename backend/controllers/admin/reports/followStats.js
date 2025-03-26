const { Op } = require("sequelize");
const { models, sequelize } = require("../../../models");

const followStats = async () => {
  try {
    // Total follow relationships
    const totalFollows = await models.Follow.count();

    // Most followed users
    const mostFollowedUsers = await models.Follow.findAll({
      attributes: [
        "followee_id",
        [sequelize.fn("COUNT", sequelize.col("followee_id")), "follower_count"]
      ],
      group: ["followee_id"],
      order: [["follower_count", "DESC"]],
      limit: 10, // Top 10 most followed users
      raw: true,
    });

    // Most active followers
    const mostActiveFollowers = await models.Follow.findAll({
      attributes: [
        "follower_id",
        [sequelize.fn("COUNT", sequelize.col("follower_id")), "following_count"]
      ],
      group: ["follower_id"],
      order: [["following_count", "DESC"]],
      limit: 10, // Top 10 most active followers
      raw: true,
    });

    return { totalFollows, mostFollowedUsers, mostActiveFollowers };
  } catch (error) {
    console.error("Error fetching follow stats:", error);
    throw error;
  }
};

module.exports = followStats;
