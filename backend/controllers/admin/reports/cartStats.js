const { Op } = require("sequelize");
const { models } = require("../../../models");

const cartStats = async ({ month, year }) => {
  try {
    const selectedMonth = parseInt(month) - 1; // 0-indexed
    const selectedYear = parseInt(year);

    const startOfMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0);

    const dateFilter = {
      createdAt: {
        [Op.between]: [startOfMonth, endOfMonth],
      },
    };

    const totalItems = await models.Cart.count({ where: dateFilter });

    const transactionTypeCounts = await models.Cart.findAll({
      attributes: [
        "transaction_type",
        [models.Cart.sequelize.fn("COUNT", models.Cart.sequelize.col("transaction_type")), "count"],
      ],
      where: dateFilter,
      group: ["transaction_type"],
      raw: true,
    });

    const statusCounts = await models.Cart.findAll({
      attributes: [
        "status",
        [models.Cart.sequelize.fn("COUNT", models.Cart.sequelize.col("status")), "count"],
      ],
      where: dateFilter,
      group: ["status"],
      raw: true,
    });

    const totalRevenue = await models.Cart.sum("price", {
      where: {
        status: "purchased",
        ...dateFilter,
      },
    });

    return {
      totalItems,
      transactionTypeCounts,
      statusCounts,
      totalRevenue: totalRevenue || 0,
    };
  } catch (error) {
    console.error("Error fetching cart stats:", error);
    throw error;
  }
};

module.exports = cartStats;
