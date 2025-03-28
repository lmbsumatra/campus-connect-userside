const { Op } = require("sequelize");
const { models, sequelize } = require("../../../models");

const followStats = async () => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of the previous month

    // Total Follows
    const totalFollowsCurrentMonth = await models.Follow.count({
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } },
    });

    const totalFollowsPastMonth = await models.Follow.count({
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
    });

    // Most Followed Users
    const mostFollowedUsersCurrentMonth = await models.Follow.findAll({
      attributes: [
        "followee_id",
        [sequelize.fn("COUNT", sequelize.col("followee_id")), "follower_count"]
      ],
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } },
      group: ["followee_id"],
      order: [[sequelize.literal("follower_count"), "DESC"]],
      limit: 10,
      raw: true,
    });

    const mostFollowedUsersPastMonth = await models.Follow.findAll({
      attributes: [
        "followee_id",
        [sequelize.fn("COUNT", sequelize.col("followee_id")), "follower_count"]
      ],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["followee_id"],
      order: [[sequelize.literal("follower_count"), "DESC"]],
      limit: 10,
      raw: true,
    });

    // Most Active Followers
    const mostActiveFollowersCurrentMonth = await models.Follow.findAll({
      attributes: [
        "follower_id",
        [sequelize.fn("COUNT", sequelize.col("follower_id")), "following_count"]
      ],
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } },
      group: ["follower_id"],
      order: [[sequelize.literal("following_count"), "DESC"]],
      limit: 10,
      raw: true,
    });

    const mostActiveFollowersPastMonth = await models.Follow.findAll({
      attributes: [
        "follower_id",
        [sequelize.fn("COUNT", sequelize.col("follower_id")), "following_count"]
      ],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["follower_id"],
      order: [[sequelize.literal("following_count"), "DESC"]],
      limit: 10,
      raw: true,
    });

    return {
      currentMonth: {
        totalFollows: totalFollowsCurrentMonth,
        mostFollowedUsers: mostFollowedUsersCurrentMonth,
        mostActiveFollowers: mostActiveFollowersCurrentMonth,
      },
      pastMonth: {
        totalFollows: totalFollowsPastMonth,
        mostFollowedUsers: mostFollowedUsersPastMonth,
        mostActiveFollowers: mostActiveFollowersPastMonth,
      }
    };
  } catch (error) {
    console.error("Error fetching follow stats:", error);
    throw error;
  }
};

module.exports = followStats;
