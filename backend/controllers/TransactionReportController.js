const { models } = require("../models/index");

module.exports = ({ emitNotification }) => {
  const createTransactionReport = async (req, res) => {
    try {
      const { transaction_id, transaction_type, reason } = req.body;
      const files = req.files;

      const transactionModel =
        transaction_type === "rental"
          ? models.RentalTransaction
          : models.BuyAndSellTransaction;

      const transaction = await transactionModel.findByPk(transaction_id, {
        include:
          transaction_type === "rental"
            ? [
                { model: models.User, as: "renter" },
                { model: models.Listing, include: ["owner"] },
              ]
            : [
                { model: models.User, as: "buyer" },
                { model: models.User, as: "seller" },
                { model: models.ItemForSale },
              ],
      });

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      const reporterId = req.user.userId;
      let reportedUserId;
      if (transaction_type === "rental") {
        reportedUserId =
          transaction.renter_id === reporterId
            ? transaction.Listing.owner_id
            : transaction.renter_id;
      } else {
        reportedUserId =
          transaction.buyer_id === reporterId
            ? transaction.seller_id
            : transaction.buyer_id;
      }

      const reportData = {
        reporter_id: reporterId,
        reported_id: reportedUserId,
        report_description: reason,
        status: "open",
        transaction_type,
        [transaction_type === "rental"
          ? "rental_transaction_id"
          : "buy_and_sell_transaction_id"]: transaction_id,
      };

      const report = await models.TransactionReport.create(reportData);

      // Handle file uploads
      const evidence = await Promise.all(
        files.map((file) =>
          models.TransactionEvidence.create({
            transaction_report_id: report.id,
            file_path: file.path,
            uploaded_by_id: reporterId,
          })
        )
      );
      // Create report
      const notification = await models.StudentNotification.create({
        sender_id: reporterId,
        recipient_id: reportedUserId,
        type: "transaction_report",
        message: `New ${transaction_type} report filed against you`,
        transaction_report_id: report.id,
        transaction_id,
      });

      if (emitNotification) {
        emitNotification(reportedUserId, notification.toJSON());
      }

      res.status(201).json({ report, evidence });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const addResponse = async (req, res) => {
    try {
      const { reportId } = req.params;
      const { response: responseText } = req.body;
      const files = req.files || [];

      const report = await models.TransactionReport.findByPk(reportId);
      if (!report) return res.status(404).json({ error: "Report not found" });

      const newResponse = await models.TransactionReportResponse.create({
        transaction_report_id: report.id,
        user_id: req.user.userId,
        response_text: responseText,
      });

      const evidenceRecords = await Promise.all(
        files.map((file) =>
          models.TransactionEvidence.create({
            transaction_report_id: report.id,
            transaction_report_response_id: newResponse.id,
            file_path: file.path,
            uploaded_by_id: req.user.userId,
          })
        )
      );

      if (report.status === "open") {
        await report.update({ status: "under_review" });
      }

      const notification = await models.StudentNotification.create({
        sender_id: req.user.userId,
        recipient_id: report.reporter_id,
        type: "transaction_report_response",
        message: `New response posted for your ${report.transaction_type} report #${report.id}`,
        transaction_report_id: report.id,
      });

      if (emitNotification) {
        emitNotification(report.reporter_id, notification.toJSON());
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
  const getAllTransactionReports = async (req, res) => {
    try {
      const reports = await models.TransactionReport.findAll({
        include: [
          { model: models.User, as: "reporter" },
          { model: models.User, as: "reported" },
          { model: models.TransactionEvidence, as: "evidence" },
          {
            model: models.RentalTransaction,
            as: "rentalTransaction",
            include: [models.Listing],
          },
          {
            model: models.BuyAndSellTransaction,
            as: "buySellTransaction",
            include: [models.ItemForSale],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(reports);
    } catch (error) {
      console.error("Error in getAllTransactionReports:", error);
      res.status(500).json({ error: error.message });
    }
  };

  const getTransactionReportById = async (req, res) => {
    try {
      const { reportId } = req.params;

      // Fetch the report first, without conditional includes
      const initialReport = await models.TransactionReport.findByPk(reportId);

      if (!initialReport)
        return res.status(404).json({ error: "Report not found" });

      // Determine transaction includes based on transaction_type
      const transactionInclude =
        initialReport.transaction_type === "rental"
          ? {
              model: models.RentalTransaction,
              as: "rentalTransaction",
              include: [{ model: models.Listing }],
            }
          : {
              model: models.BuyAndSellTransaction,
              as: "buySellTransaction",
              include: [{ model: models.ItemForSale }],
            };

      // Refetch the report with correct includes
      const fullReport = await models.TransactionReport.findByPk(reportId, {
        include: [
          { model: models.User, as: "reporter" },
          { model: models.User, as: "reported" },
          { model: models.TransactionEvidence, as: "evidence" },
          {
            model: models.TransactionReportResponse,
            as: "responses",
            include: [{ model: models.TransactionEvidence, as: "evidence" }],
          },
          transactionInclude, // Add the correct transaction model
        ],
      });

      return res.status(200).json(fullReport);
    } catch (error) {
      console.error("Error in getTransactionReportById:", error);
      res.status(500).json({ error: error.message });
    }
  };

  const markReportResolved = async (req, res) => {
    try {
      const { reportId } = req.params;
      const report = await models.TransactionReport.findByPk(reportId);

      if (!report) return res.status(404).json({ error: "Report not found" });

      // Ensure only the reporter can mark it as resolved
      if (req.user.userId !== report.reporter_id) {
        return res.status(403).json({ error: "Unauthorized action" });
      }

      await report.update({ status: "resolved" });

      // Create notification for the reportee
      const notification = await models.StudentNotification.create({
        sender_id: report.reporter_id,
        recipient_id: report.reported_id, // Notify the reportee
        type: "report_resolved",
        message: `The report filed against you has been marked as resolved.`,
        transaction_report_id: report.id,
      });

      // Emit notification in real-time
      if (emitNotification) {
        emitNotification(report.reported_id, notification.toJSON());
      }

      return res.status(200).json({ message: "Report marked as resolved" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const escalateReport = async (req, res) => {
    try {
      const { reportId } = req.params;
      const report = await models.TransactionReport.findByPk(reportId);

      if (!report) return res.status(404).json({ error: "Report not found" });

      // Ensure only the reporter can escalate the report
      if (req.user.userId !== report.reporter_id) {
        return res.status(403).json({ error: "Unauthorized action" });
      }

      await report.update({ status: "escalated" });

      // Create notification for the reportee
      const notification = await models.StudentNotification.create({
        sender_id: report.reporter_id,
        recipient_id: report.reported_id, // Notify the reportee
        type: "report_escalated",
        message: `The report filed against you has been escalated for admin review.`,
        transaction_report_id: report.id,
      });

      // Emit notification in real-time
      if (emitNotification) {
        emitNotification(report.reported_id, notification.toJSON());
      }

      return res.status(200).json({ message: "Report escalated to admin" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  return {
    createTransactionReport,
    addResponse,
    getAllTransactionReports,
    getTransactionReportById,
    markReportResolved,
    escalateReport,
  };
};
