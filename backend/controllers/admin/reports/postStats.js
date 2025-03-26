const { Op } = require("sequelize");
const { models, sequelize } = require("../../../models");

const postStats = async () => {
  try {
    const totalPosts = await models.Post.count();

    const postsByCategory = await models.Post.findAll({
      attributes: [
        "category",
        [models.Post.sequelize.fn("COUNT", "*"), "count"],
      ],
      group: ["category"],
      raw: true,
    });

    const postsByStatus = await models.Post.findAll({
      attributes: ["status", [models.Post.sequelize.fn("COUNT", "*"), "count"]],
      group: ["status"],
      raw: true,
    });

    const postsByType = await models.Post.findAll({
      attributes: [
        "post_type",
        [models.Post.sequelize.fn("COUNT", "*"), "count"],
      ],
      group: ["post_type"],
      raw: true,
    });

    const postsByUser = await models.Post.findAll({
      attributes: [
        "user_id",
        [models.Post.sequelize.fn("COUNT", "*"), "count"],
      ],
      group: ["user_id"],
      raw: true,
    });

    return {
      totalPosts,
      postsByCategory,
      postsByStatus,
      postsByType,
      postsByUser,
    };
  } catch (error) {
    console.error("Error fetching post stats:", error);
    throw error;
  }
};

module.exports = postStats;
