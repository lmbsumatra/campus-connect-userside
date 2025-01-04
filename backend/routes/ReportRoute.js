const express = require("express");
const router = express.Router();
const reportController = require("../controllers/ReportController");

// Routes for reports

router.get("/", reportController.getAllReports); // Get all reports
router.post("/", reportController.createReport); // Create a new report
router.get("/details", reportController.getReportDetails);
router.patch("/:id", reportController.updateReportStatus); // Update a report (e.g., status)
router.delete("/:id", reportController.deleteReport); // Delete a report

module.exports = router;
