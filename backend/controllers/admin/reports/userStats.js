const { Sequelize } = require("sequelize");
const { models } = require("../../../models");

const usersStats = async () => {
  try {
    const userStats = await models.User.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("user_id")), "total_users"],
        [Sequelize.fn("SUM", Sequelize.literal("role = 'admin'")), "total_admins"],
        [Sequelize.fn("SUM", Sequelize.literal("role = 'student'")), "total_students"],
        [Sequelize.fn("SUM", Sequelize.literal("role = 'superadmin'")), "total_superadmins"],
        [Sequelize.fn("SUM", Sequelize.literal("email_verified = 1")), "verified_users"],
        [Sequelize.fn("SUM", Sequelize.literal("is_stripe_completed = 1")), "stripe_completed_users"],
      ],
      raw: true,
    });

    return userStats[0];
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    throw error;
  }
};

module.exports = usersStats;
