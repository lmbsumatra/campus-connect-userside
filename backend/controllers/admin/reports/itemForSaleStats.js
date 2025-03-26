const { Op } = require("sequelize");
const { models } = require("../../../models");

const itemForSaleStats = async () => {
  try {
    const totalItems = await models.ItemForSale.count();
    const approvedItems = await models.ItemForSale.count({ where: { status: "approved" } });
    const declinedItems = await models.ItemForSale.count({ where: { status: "declined" } });
    const removedItems = await models.ItemForSale.count({ where: { status: "removed" } });
    const flaggedItems = await models.ItemForSale.count({ where: { status: "flagged" } });
    
    const averagePrice = await models.ItemForSale.findOne({
      attributes: [[models.ItemForSale.sequelize.fn("AVG", models.ItemForSale.sequelize.col("price")), "avgPrice"]],
      raw: true,
    });
    
    const popularCategories = await models.ItemForSale.findAll({
      attributes: [
        "category",
        [models.ItemForSale.sequelize.fn("COUNT", models.ItemForSale.sequelize.col("category")), "count"],
      ],
      group: ["category"],
      order: [[models.ItemForSale.sequelize.literal("count"), "DESC"]],
      limit: 5,
      raw: true,
    });
    
    const paymentModes = await models.ItemForSale.findAll({
      attributes: [
        "payment_mode",
        [models.ItemForSale.sequelize.fn("COUNT", models.ItemForSale.sequelize.col("payment_mode")), "count"],
      ],
      group: ["payment_mode"],
      raw: true,
    });
    
    return {
      totalItems,
      approvedItems,
      declinedItems,
      removedItems,
      flaggedItems,
      averagePrice: averagePrice.avgPrice || 0,
      popularCategories,
      paymentModes,
    };
  } catch (error) {
    console.error("Error fetching item for sale stats:", error);
    throw new Error("Failed to fetch item for sale stats");
  }
};

module.exports = itemForSaleStats;
