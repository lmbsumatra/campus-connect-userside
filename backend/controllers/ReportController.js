// backend/controllers/ReportController.js
const { models } = require("../models/index");
const Report = models.Report; // Import the Report model

//  Create a new report
exports.createReport = async (req, res) => {
  try {
    const { reporter_id, reported_entity_id, entity_type, reason } = req.body;

    // Validate inputs
    if (!reporter_id || !reported_entity_id || !entity_type || !reason) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Create a new report
    const newReport = await Report.create({
      reporter_id,
      reported_entity_id,
      entity_type,
      reason,
    });

    res.status(201).json(newReport);
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: "Failed to create report." });
  }
};

// Get all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [
        {
          model: models.User,
          as: "reporter", 
          attributes: ["user_id", "first_name", "last_name"],
        },
      ],
    });
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports." });
  }
};

// Update report status
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: "Report not found." });
    }

    report.status = status;
    await report.save();

    res.status(200).json(report);
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ error: "Failed to update report status." });
  }
};

// Delete a report
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: "Report not found." });
    }

    await report.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ error: "Failed to delete report." });
  }
};
