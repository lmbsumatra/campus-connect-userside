const { Op } = require("sequelize");
const { models, sequelize } = require("../../../models");

const postStats = async ({ month, year }) => {
  try {
    const selectedMonth = parseInt(month) - 1; // 0-indexed
    const selectedYear = parseInt(year);

    const startOfCurrentMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfCurrentMonth = new Date(selectedYear, selectedMonth + 1, 0);

    const startOfPastMonth = new Date(selectedYear, selectedMonth - 1, 1);
    const endOfPastMonth = new Date(selectedYear, selectedMonth, 0);

    // Total Posts
    const totalPostsCurrentMonth = await models.Post.count({
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } }
    });

    const totalPostsPastMonth = await models.Post.count({
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } }
    });

    // Posts By Category
    const postsByCategoryCurrentMonth = await models.Post.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", "*"), "count"]
      ],
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      group: ["category"],
      raw: true,
    });

    const postsByCategoryPastMonth = await models.Post.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", "*"), "count"]
      ],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["category"],
      raw: true,
    });

    // Posts By Status
    const postsByStatusCurrentMonth = await models.Post.findAll({
      attributes: ["status", [sequelize.fn("COUNT", "*"), "count"]],
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      group: ["status"],
      raw: true,
    });

    const postsByStatusPastMonth = await models.Post.findAll({
      attributes: ["status", [sequelize.fn("COUNT", "*"), "count"]],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["status"],
      raw: true,
    });

    // Posts By Type
    const postsByTypeCurrentMonth = await models.Post.findAll({
      attributes: ["post_type", [sequelize.fn("COUNT", "*"), "count"]],
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      group: ["post_type"],
      raw: true,
    });

    const postsByTypePastMonth = await models.Post.findAll({
      attributes: ["post_type", [sequelize.fn("COUNT", "*"), "count"]],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["post_type"],
      raw: true,
    });

    // Posts By User
    const postsByUserCurrentMonth = await models.Post.findAll({
      attributes: ["user_id", [sequelize.fn("COUNT", "*"), "count"]],
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      group: ["user_id"],
      raw: true,
    });

    const postsByUserPastMonth = await models.Post.findAll({
      attributes: ["user_id", [sequelize.fn("COUNT", "*"), "count"]],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["user_id"],
      raw: true,
    });

    return {
      currentMonth: {
        totalPosts: totalPostsCurrentMonth,
        postsByCategory: postsByCategoryCurrentMonth,
        postsByStatus: postsByStatusCurrentMonth,
        postsByType: postsByTypeCurrentMonth,
        postsByUser: postsByUserCurrentMonth,
      },
      pastMonth: {
        totalPosts: totalPostsPastMonth,
        postsByCategory: postsByCategoryPastMonth,
        postsByStatus: postsByStatusPastMonth,
        postsByType: postsByTypePastMonth,
        postsByUser: postsByUserPastMonth,
      }
    };
  } catch (error) {
    console.error("Error fetching post stats:", error);
    throw error;
  }
};

module.exports = postStats;
