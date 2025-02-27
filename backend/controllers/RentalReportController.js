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
      // Use the reportId from req.params (ensure the parameter name matches your route)
      const { reportId } = req.params;
      const { reason } = req.body;
      const files = req.files;

      const report = await models.RentalReport.findByPk(reportId);
      if (!report) {
        console.error(
          "addResponse error: Report not found with reportId:",
          reportId
        );
        return res.status(404).json({ error: "Report not found" });
      }

      // Update report with response details
      await report.update({
        status: "under_review",
        response_description: reason,
        response_by_id: req.user.userId,
        rental_report_id: report.id,
      });

      // Create evidence records for each uploaded file
      const evidence = await Promise.all(
        files.map(async (file) => {
          try {
            return await models.RentalEvidence.create({
              rental_report_id: report.id,
              file_path: file.path,
              uploaded_by_id: req.user.userId,
            });
          } catch (e) {
            console.error("Error creating RentalEvidence for file:", file, e);
            throw e;
          }
        })
      );

      // Create student notification for the original reporter
      const notification = await models.StudentNotification.create({
        sender_id: req.user.userId,
        recipient_id: report.reporter_id,
        type: "report_response",
        message: `Response added to your report #${report.id}`,
        rental_report_id: report.id,
        rental_id: report.rental_id,
      });

      // Emit the notification using the injected emitter (converted to plain object)
      if (emitNotification) {
        emitNotification(report.reporter_id, notification.toJSON());
      }

      res
        .status(200)
        .json({ message: "Response added successfully", evidence });
    } catch (error) {
      console.error("Error in addResponse:", error);
      console.error("Stack Trace:", error.stack);
      res.status(500).json({ error: error.message });
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
      const report = await models.RentalReport.findByPk(reportId, {
        include: [
          { model: models.User, as: "reporter" },
          { model: models.User, as: "reported" },
          { model: models.RentalEvidence, as: "evidence" },
          { model: models.RentalTransaction, as: "rentalTransaction" },
        ],
      });
      if (!report) {
        console.error(
          "getRentalReportById error: Report not found with reportId:",
          reportId
        );
        return res.status(404).json({ error: "Report not found" });
      }
      res.status(200).json(report);
    } catch (error) {
      console.error("Error in getRentalReportById:", error);
      console.error("Stack Trace:", error.stack);
      res.status(500).json({ error: error.message });
    }
  };

  return {
    createRentalReport,
    addResponse,
    getAllRentalReports,
    getRentalReportById,
  };
};
