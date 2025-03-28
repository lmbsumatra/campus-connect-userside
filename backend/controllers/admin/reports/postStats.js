const { Op } = require("sequelize");
const { models, sequelize } = require("../../../models");

const postStats = async () => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of the previous month

    // Total Posts
    const totalPostsCurrentMonth = await models.Post.count({
      where: { created_at: { [Op.gte]: startOfCurrentMonth } }
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
      where: { created_at: { [Op.gte]: startOfCurrentMonth } },
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
      where: { created_at: { [Op.gte]: startOfCurrentMonth } },
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
      where: { created_at: { [Op.gte]: startOfCurrentMonth } },
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
      where: { created_at: { [Op.gte]: startOfCurrentMonth } },
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
