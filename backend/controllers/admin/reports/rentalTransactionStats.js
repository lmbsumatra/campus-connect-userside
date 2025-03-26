const { models, sequelize } = require("../../../models");


const rentalTransactionStats = async () => {
  try {
    const totalTransactions = await models.RentalTransaction.count();
    const transactionTypeCounts = await models.RentalTransaction.findAll({
      attributes: ["transaction_type", [sequelize.fn("COUNT", "*") , "count"]],
      group: ["transaction_type"],
      raw: true,
    });
    const transactionStatusCounts = await models.RentalTransaction.findAll({
      attributes: ["status", [sequelize.fn("COUNT", "*") , "count"]],
      group: ["status"],
      raw: true,
    });
    const paymentStatusCounts = await models.RentalTransaction.findAll({
      attributes: ["payment_status", [sequelize.fn("COUNT", "*") , "count"]],
      group: ["payment_status"],
      raw: true,
    });
    const deliveryMethodCounts = await models.RentalTransaction.findAll({
      attributes: ["delivery_method", [sequelize.fn("COUNT", "*") , "count"]],
      group: ["delivery_method"],
      raw: true,
    });

    return {
      totalTransactions,
      transactionTypeCounts,
      transactionStatusCounts,
      paymentStatusCounts,
      deliveryMethodCounts,
    };
  } catch (error) {
    console.error("Error fetching rental transaction stats:", error);
    throw error;
  }
};

module.exports = rentalTransactionStats;
