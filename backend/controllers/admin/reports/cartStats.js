const { models } = require("../../../models");

const cartStats = async () => {
  try {
    const totalItems = await models.Cart.count();
    
    const transactionTypeCounts = await models.Cart.findAll({
      attributes: [
        "transaction_type",
        [models.Cart.sequelize.fn("COUNT", models.Cart.sequelize.col("transaction_type")), "count"],
      ],
      group: ["transaction_type"],
      raw: true,
    });

    const statusCounts = await models.Cart.findAll({
      attributes: [
        "status",
        [models.Cart.sequelize.fn("COUNT", models.Cart.sequelize.col("status")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    const totalRevenue = await models.Cart.sum("price", { where: { status: "purchased" } });

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