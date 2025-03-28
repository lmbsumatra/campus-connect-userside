const { Op } = require("sequelize");
const { models } = require("../../../models");

const itemForSaleStats = async () => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of the previous month

    // Total Items
    const totalItemsCurrentMonth = await models.ItemForSale.count({
      where: { created_at: { [Op.gte]: startOfCurrentMonth } },
    });

    const totalItemsPastMonth = await models.ItemForSale.count({
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
    });

    // Status Counts
    const statusCountsCurrentMonth = await models.ItemForSale.findAll({
      attributes: [
        "status",
        [models.ItemForSale.sequelize.fn("COUNT", "*"), "count"],
      ],
      where: { created_at: { [Op.gte]: startOfCurrentMonth } },
      group: ["status"],
      raw: true,
    });

    const statusCountsPastMonth = await models.ItemForSale.findAll({
      attributes: [
        "status",
        [models.ItemForSale.sequelize.fn("COUNT", "*"), "count"],
      ],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["status"],
      raw: true,
    });

    // Average Price
    const averagePriceCurrentMonth = await models.ItemForSale.findOne({
      attributes: [[models.ItemForSale.sequelize.fn("AVG", models.ItemForSale.sequelize.col("price")), "avgPrice"]],
      where: { created_at: { [Op.gte]: startOfCurrentMonth } },
      raw: true,
    });

    const averagePricePastMonth = await models.ItemForSale.findOne({
      attributes: [[models.ItemForSale.sequelize.fn("AVG", models.ItemForSale.sequelize.col("price")), "avgPrice"]],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      raw: true,
    });

    // Popular Categories
    const popularCategoriesCurrentMonth = await models.ItemForSale.findAll({
      attributes: [
        "category",
        [models.ItemForSale.sequelize.fn("COUNT", models.ItemForSale.sequelize.col("category")), "count"],
      ],
      where: { created_at: { [Op.gte]: startOfCurrentMonth } },
      group: ["category"],
      order: [[models.ItemForSale.sequelize.literal("count"), "DESC"]],
      limit: 5,
      raw: true,
    });

    const popularCategoriesPastMonth = await models.ItemForSale.findAll({
      attributes: [
        "category",
        [models.ItemForSale.sequelize.fn("COUNT", models.ItemForSale.sequelize.col("category")), "count"],
      ],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["category"],
      order: [[models.ItemForSale.sequelize.literal("count"), "DESC"]],
      limit: 5,
      raw: true,
    });

    // Payment Modes
    const paymentModesCurrentMonth = await models.ItemForSale.findAll({
      attributes: [
        "payment_mode",
        [models.ItemForSale.sequelize.fn("COUNT", models.ItemForSale.sequelize.col("payment_mode")), "count"],
      ],
      where: { created_at: { [Op.gte]: startOfCurrentMonth } },
      group: ["payment_mode"],
      raw: true,
    });

    const paymentModesPastMonth = await models.ItemForSale.findAll({
      attributes: [
        "payment_mode",
        [models.ItemForSale.sequelize.fn("COUNT", models.ItemForSale.sequelize.col("payment_mode")), "count"],
      ],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["payment_mode"],
      raw: true,
    });

    return {
      currentMonth: {
        totalItems: totalItemsCurrentMonth,
        statusCounts: statusCountsCurrentMonth,
        averagePrice: parseFloat(averagePriceCurrentMonth?.avgPrice || 0).toFixed(2),
        popularCategories: popularCategoriesCurrentMonth,
        paymentModes: paymentModesCurrentMonth,
      },
      pastMonth: {
        totalItems: totalItemsPastMonth,
        statusCounts: statusCountsPastMonth,
        averagePrice: parseFloat(averagePricePastMonth?.avgPrice || 0).toFixed(2),
        popularCategories: popularCategoriesPastMonth,
        paymentModes: paymentModesPastMonth,
      }
    };
  } catch (error) {
    console.error("Error fetching item for sale stats:", error);
    throw new Error("Failed to fetch item for sale stats");
  }
};

module.exports = itemForSaleStats;
