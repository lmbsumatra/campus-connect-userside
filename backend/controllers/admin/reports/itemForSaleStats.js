const { Op } = require("sequelize");
const { models } = require("../../../models");

const itemForSaleStats = async ({ month, year }) => {
  try {
    const selectedMonth = parseInt(month) - 1; // 0-indexed
    const selectedYear = parseInt(year);

    const startOfCurrentMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfCurrentMonth = new Date(selectedYear, selectedMonth + 1, 0);

    const startOfPastMonth = new Date(selectedYear, selectedMonth - 1, 1);
    const endOfPastMonth = new Date(selectedYear, selectedMonth, 0);

    // Total Items in selected month
    const totalItemsCurrentMonth = await models.ItemForSale.count({
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
    });

    const totalItemsPastMonth = await models.ItemForSale.count({
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
    });

    // Status Counts in selected month
    const statusCountsCurrentMonth = await models.ItemForSale.findAll({
      attributes: [
        "status",
        [models.ItemForSale.sequelize.fn("COUNT", "*"), "count"],
      ],
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
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

    // Average Price in selected month
    const averagePriceCurrentMonth = await models.ItemForSale.findOne({
      attributes: [[models.ItemForSale.sequelize.fn("AVG", models.ItemForSale.sequelize.col("price")), "avgPrice"]],
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      raw: true,
    });

    const averagePricePastMonth = await models.ItemForSale.findOne({
      attributes: [[models.ItemForSale.sequelize.fn("AVG", models.ItemForSale.sequelize.col("price")), "avgPrice"]],
      where: { created_at: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      raw: true,
    });

    // Popular Categories in selected month
    const popularCategoriesCurrentMonth = await models.ItemForSale.findAll({
      attributes: [
        "category",
        [models.ItemForSale.sequelize.fn("COUNT", models.ItemForSale.sequelize.col("category")), "count"],
      ],
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
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

    // Payment Modes in selected month
    const paymentModesCurrentMonth = await models.ItemForSale.findAll({
      attributes: [
        "payment_mode",
        [models.ItemForSale.sequelize.fn("COUNT", models.ItemForSale.sequelize.col("payment_mode")), "count"],
      ],
      where: { created_at: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
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
