const { models } = require("../models/index");

module.exports = ({ emitNotification }) => {
  const createRentalReport = async (req, res) => {
    try {
      const { rental_transaction_id, reason } = req.body;
      const report_description = reason;
      const files = req.files;

      // Get rental transaction details
      const transaction = await models.RentalTransaction.findByPk(
        rental_transaction_id,
        {
          include: [
            { model: models.User, as: "renter" },
            { model: models.Listing, include: ["owner"] },
          ],
        }
      );

      if (!transaction) {
        console.error(
          "createRentalReport error: Transaction not found for rental_transaction_id:",
          rental_transaction_id
        );
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Determine reported user (opposite party)
      const reporterId = req.user.userId;
      const reportedUserId =
        transaction.renter_id === reporterId
          ? transaction.Listing.owner_id
          : transaction.renter_id;

      // Create report
      const report = await models.RentalReport.create({
        rental_id: rental_transaction_id,
        reporter_id: reporterId,
        reported_id: reportedUserId,
        report_description,
        status: "open",
      });

      // Handle file uploads
      const evidence = await Promise.all(
        files.map(async (file) => {
          try {
            return await models.RentalEvidence.create({
              rental_report_id: report.id,
              file_path: file.path,
              uploaded_by_id: reporterId,
            });
          } catch (e) {
            console.error("Error creating RentalEvidence for file:", file, e);
            throw e;
          }
        })
      );

      // Create student notification for the reported user
      const notification = await models.StudentNotification.create({
        sender_id: reporterId,
        recipient_id: reportedUserId,
        type: "rental_report",
        message: `New report filed against you for transaction #${transaction.id}`,
        rental_report_id: report.id,
        rental_id: rental_transaction_id,
      });

      // Emit the notification using the injected emitter (converted to plain object)
      if (emitNotification) {
        emitNotification(reportedUserId, notification.toJSON());
      }

      res.status(201).json({ report, evidence });
    } catch (error) {
      console.error("Error in createRentalReport:", error);
      console.error("Stack Trace:", error.stack);
      res.status(500).json({ error: error.message });
    }
  };

  const addResponse = async (req, res) => {
    try {
      const { reportId } = req.params;
      const { response: responseText } = req.body; // text of the response
      const files = req.files || [];

      // Find the report being responded to
      const report = await models.RentalReport.findByPk(reportId);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      // Create a new response entry linked to the report
      const newResponse = await models.RentalReportResponse.create({
        rental_report_id: report.id,
        user_id: req.user.userId, // ID of the user submitting the response (the reportee)
        response_text: responseText,
      });

      // Save any uploaded evidence files for this response
      const evidenceRecords = await Promise.all(
        files.map((file) =>
          models.RentalEvidence.create({
            rental_report_id: report.id,
            rental_report_response_id: newResponse.id, // link evidence to this response
            file_path: file.path,
            uploaded_by_id: req.user.userId,
          })
        )
      );

      // Update report status to "under_review" since the reportee has responded
      if (report.status === "open") {
        await report.update({ status: "under_review" });
      }

      // Notify the original reporter about the new response
      await models.StudentNotification.create({
        sender_id: req.user.userId, // reportee who responded
        recipient_id: report.reporter_id, // original reporter
        type: "report_response",
        message: `New response posted for your report #${report.id}`,
        rental_report_id: report.id,
      });
      if (emitNotification) {
        // emitNotification is injected via dependencies for real-time updates
        emitNotification(report.reporter_id, {
          message: "New response added",
          reportId: report.id,
        });
      }

      return res.status(201).json({
        message: "Response added successfully",
        response: newResponse,
        evidence: evidenceRecords,
      });
    } catch (error) {
      console.error("Error in addResponse:", error);
      return res.status(500).json({ error: error.message });
    }
  };

  const getAllRentalReports = async (req, res) => {
    try {
      const reports = await models.RentalReport.findAll({
        include: [
          { model: models.User, as: "reporter" },
          { model: models.User, as: "reported" },
          { model: models.RentalEvidence, as: "evidence" },
          { model: models.RentalTransaction, as: "rentalTransaction" },
        ],
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(reports);
    } catch (error) {
      console.error("Error in getAllRentalReports:", error);
      console.error("Stack Trace:", error.stack);
      res.status(500).json({ error: error.message });
    }
  };

  const getRentalReportById = async (req, res) => {
    try {
      const { reportId } = req.params;
      console.log(`Fetching report with ID: ${reportId}`);

      const report = await models.RentalReport.findByPk(reportId, {
        include: [
          { model: models.User, as: "reporter" },
          { model: models.User, as: "reported" },
          { model: models.RentalEvidence, as: "evidence" },
          {
            model: models.RentalReportResponse,
            as: "responses",
            include: [{ model: models.RentalEvidence, as: "evidence" }],
          },
          {
            model: models.RentalTransaction,
            as: "rentalTransaction",
            include: [{ model: models.Listing }], // ensure Listing is included
          },
        ],
      });

      if (!report) {
        console.log(`Report not found for ID: ${reportId}`); // Log if report is not found
        return res.status(404).json({ error: "Report not found" });
      }
      return res.status(200).json(report);
    } catch (error) {
      console.error("Error in getRentalReportById:", error);
      res.status(500).json({ error: error.message });
    }
  };

  const markReportResolved = async (req, res) => {
    try {
      const { reportId } = req.params;
      const report = await models.RentalReport.findByPk(reportId);
      if (!report) return res.status(404).json({ error: "Report not found" });
      // Only the original reporter should close the report
      if (req.user.userId !== report.reporter_id) {
        return res
          .status(403)
          .json({ error: "Only the reporter can resolve this report" });
      }
      await report.update({ status: "resolved" });
      // (Optional) notify the other party that the report was resolved
      return res.status(200).json({ message: "Report marked as resolved" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const escalateReport = async (req, res) => {
    try {
      const { reportId } = req.params;
      const report = await models.RentalReport.findByPk(reportId);
      if (!report) return res.status(404).json({ error: "Report not found" });
      if (req.user.userId !== report.reporter_id) {
        return res
          .status(403)
          .json({ error: "Only the reporter can escalate this report" });
      }
      // Update status to "escalated" for admin review (ensure "escalated" is allowed in model)
      await report.update({ status: "escalated" });
      // (Optional) send notification to admin or flag for admin review
      return res
        .status(200)
        .json({ message: "Report escalated to admin for review" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  return {
    createRentalReport,
    addResponse,
    getAllRentalReports,
    getRentalReportById,
    markReportResolved,
    escalateReport,
  };
};
