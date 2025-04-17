const { Op } = require("sequelize");
const { models, sequelize } = require("../../../models");

const followStats = async ({ month, year }) => {
  try {
    const selectedMonth = parseInt(month) - 1; // 0-indexed
    const selectedYear = parseInt(year);

    const startOfCurrentMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfCurrentMonth = new Date(selectedYear, selectedMonth + 1, 0);

    const startOfPastMonth = new Date(selectedYear, selectedMonth - 1, 1);
    const endOfPastMonth = new Date(selectedYear, selectedMonth, 0);

    // Total Follows in selected month
    const totalFollowsCurrentMonth = await models.Follow.count({
      where: { createdAt: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
    });

    // Total Follows in past month
    const totalFollowsPastMonth = await models.Follow.count({
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
    });

    // Most Followed Users in selected month
    const mostFollowedUsersCurrentMonth = await models.Follow.findAll({
      attributes: [
        "followee_id",
        [sequelize.fn("COUNT", sequelize.col("followee_id")), "follower_count"]
      ],
      where: { createdAt: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      group: ["followee_id"],
      order: [[sequelize.literal("follower_count"), "DESC"]],
      limit: 10,
      raw: true,
    });

    // Most Followed Users in past month
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

    // Most Active Followers in selected month
    const mostActiveFollowersCurrentMonth = await models.Follow.findAll({
      attributes: [
        "follower_id",
        [sequelize.fn("COUNT", sequelize.col("follower_id")), "following_count"]
      ],
      where: { createdAt: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      group: ["follower_id"],
      order: [[sequelize.literal("following_count"), "DESC"]],
      limit: 10,
      raw: true,
    });

    // Most Active Followers in past month
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
