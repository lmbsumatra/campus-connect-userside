const getAuditStats = require("./reports/auditStats");
const getCartStats = require("./reports/cartStats");
const getConversationStats = require("./reports/conversationStats");
const getFollowStats = require("./reports/followStats");
const getItemForSaleStats = require("./reports/itemForSaleStats");
const getListingStats = require("./reports/listingStats");
const getPostStats = require("./reports/postStats");
const getRentalTransactionStats = require("./reports/rentalTransactionStats");
const getReportStats = require("./reports/reportStats");
const getReviewStats = require("./reports/reviewStats");
const getStudentStats = require("./reports/studentStats");
const getTransactionReportStats = require("./reports/transactionReportStats");
const getUsersStats = require("./reports/userStats");

const reportGeneration = async (req, res) => {
  try {
    const [
      auditStats,
      cartStats,
      conversationStats,
      followStats,
      itemForSaleStats,
      listingStats,
      postStats,
      rentalTransactionStats,
      reportStats,
      reviewStats,
      studentStats,
      transactionReportStats,
      usersStats,
    ] = await Promise.all([
      getAuditStats(),
      getCartStats(),
      getConversationStats(),
      getFollowStats(),
      getItemForSaleStats(),
      getListingStats(),
      getPostStats(),
      getRentalTransactionStats(),
      getReportStats(),
      getReviewStats(),
      getStudentStats(),
      getTransactionReportStats(),
      getUsersStats(),
    ]);

    res.json({
      auditStats,
      cartStats,
      conversationStats,
      followStats,
      itemForSaleStats,
      listingStats,
      postStats,
      rentalTransactionStats,
      reportStats,
      reviewStats,
      studentStats,
      transactionReportStats,
      usersStats,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = reportGeneration;
