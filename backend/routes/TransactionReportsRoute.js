const express = require("express");
const router = express.Router();
const TransactionReportController = require("../controllers/TransactionReportController");
const { uploadEvidence } = require("../config/multer");
const authenticateToken = require("../middlewares/StudentAuthMiddleware");

module.exports = (dependencies) => {
  router.get(
    "/:reportId",
    authenticateToken,
    TransactionReportController(dependencies).getTransactionReportById
  );

  router.get(
    "/",
    authenticateToken,
    TransactionReportController(dependencies).getAllTransactionReports
  );

  router.post(
    "/",
    authenticateToken,
    uploadEvidence,
    TransactionReportController(dependencies).createTransactionReport
  );

  router.post(
    "/:reportId/response",
    authenticateToken,
    uploadEvidence,
    TransactionReportController(dependencies).addResponse
  );

  router.put(
    "/:reportId/resolve",
    authenticateToken,
    TransactionReportController(dependencies).markReportResolved
  );

  router.put(
    "/:reportId/escalate",
    authenticateToken,
    TransactionReportController(dependencies).escalateReport
  );

  return router;
};
