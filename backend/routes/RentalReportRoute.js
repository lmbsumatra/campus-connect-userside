const express = require("express");
const router = express.Router();
const RentalReportController = require("../controllers/RentalReportController");
const { uploadEvidence } = require("../config/multer");
const authenticateToken = require("../middlewares/StudentAuthMiddleware");

module.exports = (dependencies) => {
  // Get Report Details
  router.get(
    "/:reportId",
    authenticateToken,
    RentalReportController(dependencies).getRentalReportById
  );

  // Get All Reports
  router.get(
    "/",
    authenticateToken,
    RentalReportController(dependencies).getAllRentalReports
  );
  // Create Report
  router.post(
    "/",
    authenticateToken,
    uploadEvidence,
    RentalReportController(dependencies).createRentalReport
  );

  // Add Response
  router.post(
    "/:reportId/response",
    authenticateToken,
    uploadEvidence,
    RentalReportController(dependencies).addResponse
  );

  // Mark report as resolved (reporter only)
  router.put(
    "/:reportId/resolve",
    authenticateToken,
    RentalReportController(dependencies).markReportResolved
  );

  // Escalate report to admin review (reporter only)
  router.put(
    "/:reportId/escalate",
    authenticateToken,
    RentalReportController(dependencies).escalateReport
  );

  return router;
};
