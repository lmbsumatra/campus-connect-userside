const { Op, Sequelize } = require("sequelize");
const { models, sequelize } = require("../../../models");

const rentalTransactionStats = async ({ month, year }) => {
  try {
    const selectedMonth = parseInt(month) - 1; // 0-indexed
    const selectedYear = parseInt(year);

    const startOfCurrentMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfCurrentMonth = new Date(selectedYear, selectedMonth + 1, 0);

    const startOfPastMonth = new Date(selectedYear, selectedMonth - 1, 1);
    const endOfPastMonth = new Date(selectedYear, selectedMonth, 0);

    // Total Transactions
    const totalTransactionsCurrentMonth = await models.RentalTransaction.count({
      where: { createdAt: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } }
    });

    const totalTransactionsPastMonth = await models.RentalTransaction.count({
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } }
    });

    // Transaction Type Counts
    const transactionTypeCountsCurrentMonth = await models.RentalTransaction.findAll({
      attributes: ["transaction_type", [sequelize.fn("COUNT", "*"), "count"]],
      where: { createdAt: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      group: ["transaction_type"],
      raw: true,
    });

    const transactionTypeCountsPastMonth = await models.RentalTransaction.findAll({
      attributes: ["transaction_type", [sequelize.fn("COUNT", "*"), "count"]],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["transaction_type"],
      raw: true,
    });

    // Transaction Status Counts
    const transactionStatusCountsCurrentMonth = await models.RentalTransaction.findAll({
      attributes: ["status", [sequelize.fn("COUNT", "*"), "count"]],
      where: { createdAt: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      group: ["status"],
      raw: true,
    });

    const transactionStatusCountsPastMonth = await models.RentalTransaction.findAll({
      attributes: ["status", [sequelize.fn("COUNT", "*"), "count"]],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["status"],
      raw: true,
    });

    // Payment Status Counts
    const paymentStatusCountsCurrentMonth = await models.RentalTransaction.findAll({
      attributes: ["payment_status", [sequelize.fn("COUNT", "*"), "count"]],
      where: { createdAt: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      group: ["payment_status"],
      raw: true,
    });

    const paymentStatusCountsPastMonth = await models.RentalTransaction.findAll({
      attributes: ["payment_status", [sequelize.fn("COUNT", "*"), "count"]],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["payment_status"],
      raw: true,
    });

    // Delivery Method Counts
    const deliveryMethodCountsCurrentMonth = await models.RentalTransaction.findAll({
      attributes: ["delivery_method", [sequelize.fn("COUNT", "*"), "count"]],
      where: { createdAt: {  [Op.between]: [startOfCurrentMonth, endOfCurrentMonth], } },
      group: ["delivery_method"],
      raw: true,
    });

    const deliveryMethodCountsPastMonth = await models.RentalTransaction.findAll({
      attributes: ["delivery_method", [sequelize.fn("COUNT", "*"), "count"]],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["delivery_method"],
      raw: true,
    });

    return {
      currentMonth: {
        totalTransactions: totalTransactionsCurrentMonth,
        transactionTypeCounts: transactionTypeCountsCurrentMonth,
        transactionStatusCounts: transactionStatusCountsCurrentMonth,
        paymentStatusCounts: paymentStatusCountsCurrentMonth,
        deliveryMethodCounts: deliveryMethodCountsCurrentMonth,
      },
      pastMonth: {
        totalTransactions: totalTransactionsPastMonth,
        transactionTypeCounts: transactionTypeCountsPastMonth,
        transactionStatusCounts: transactionStatusCountsPastMonth,
        paymentStatusCounts: paymentStatusCountsPastMonth,
        deliveryMethodCounts: deliveryMethodCountsPastMonth,
      }
    };
  } catch (error) {
    console.error("Error fetching rental transaction stats:", error);
    throw error;
  }
};

module.exports = rentalTransactionStats;
