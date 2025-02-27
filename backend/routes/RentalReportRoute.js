const express = require("express");
const router = express.Router();
const RentalReportController = require("../controllers/RentalReportController");
const { uploadEvidence } = require("../config/multer");
const authenticateToken = require("../middlewares/StudentAuthMiddleware");

module.exports = (dependencies) => {
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

  return router;
};
