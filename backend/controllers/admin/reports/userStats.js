const { Sequelize, Op } = require("sequelize");
const { models } = require("../../../models");

const usersStats = async ({ month, year }) => {
  try {
    const selectedMonth = parseInt(month) - 1; // 0-indexed
    const selectedYear = parseInt(year);

    const startOfCurrentMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfCurrentMonth = new Date(selectedYear, selectedMonth + 1, 0);

    const startOfPastMonth = new Date(selectedYear, selectedMonth - 1, 1);
    const endOfPastMonth = new Date(selectedYear, selectedMonth, 0);

    // Stats for current month
    const userStatsCurrentMonth = await models.User.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("user_id")), "total_users"],
        [
          Sequelize.fn("SUM", Sequelize.literal("role = 'admin'")),
          "total_admins",
        ],
        [
          Sequelize.fn("SUM", Sequelize.literal("role = 'student'")),
          "total_students",
        ],
        [
          Sequelize.fn("SUM", Sequelize.literal("role = 'superadmin'")),
          "total_superadmins",
        ],
        [
          Sequelize.fn("SUM", Sequelize.literal("email_verified = 1")),
          "verified_users",
        ],
        [
          Sequelize.fn("SUM", Sequelize.literal("is_stripe_completed = 1")),
          "stripe_completed_users",
        ],
      ],
      where: {
        createdAt: { [Op.between]: [startOfCurrentMonth, endOfCurrentMonth] },
      },
      raw: true,
    });

    // Stats for past month
    const userStatsPastMonth = await models.User.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("user_id")), "total_users"],
        [
          Sequelize.fn("SUM", Sequelize.literal("role = 'admin'")),
          "total_admins",
        ],
        [
          Sequelize.fn("SUM", Sequelize.literal("role = 'student'")),
          "total_students",
        ],
        [
          Sequelize.fn("SUM", Sequelize.literal("role = 'superadmin'")),
          "total_superadmins",
        ],
        [
          Sequelize.fn("SUM", Sequelize.literal("email_verified = 1")),
          "verified_users",
        ],
        [
          Sequelize.fn("SUM", Sequelize.literal("is_stripe_completed = 1")),
          "stripe_completed_users",
        ],
      ],
      where: {
        createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] },
      },
      raw: true,
    });

    return {
      currentMonth: userStatsCurrentMonth[0],
      pastMonth: userStatsPastMonth[0],
    };
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    throw error;
  }
};

module.exports = usersStats;
