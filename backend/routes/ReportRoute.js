const express = require("express");
const router = express.Router();
const reportController = require("../controllers/ReportController");
const checkUnavailableDate = require("../middlewares/CheckUnavailableDate");
const logAdminActivity = require("../middlewares/auditMiddleware");
const { authenticateToken } = require("../middlewares/AdminAuthMiddleware");

// Routes for reports

router.get("/", reportController.getAllReports); // Get all reports
router.post("/", checkUnavailableDate, reportController.createReport); // Create a new report
router.get("/details", reportController.getReportDetails);
router.patch(
  "/:id",
  authenticateToken,
  logAdminActivity,
  reportController.updateReportStatus
); // Update a report (e.g., status)
// router.delete(
//   "/:id",
//   authenticateToken,
//   logAdminActivity,
//   reportController.deleteReport
// ); // Delete a report
router.get("/check", reportController.checkReport);

module.exports = router;
