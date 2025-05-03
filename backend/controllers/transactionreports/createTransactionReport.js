const { models } = require("../../models/index");
const { Op } = require("sequelize");
const sequelize = require("../../config/database");

module.exports =
  ({ emitNotification }) =>
  async (req, res) => {
    try {
      const { transaction_id, transaction_type, reason } = req.body;
      const files = req.files || [];
      const reporterId = req.user.userId;

      // Standardize transaction type handling
      const normalizedType = transaction_type;

      // Use RentalTransaction model to fetch transaction details
      const transaction = await models.RentalTransaction.findByPk(
        transaction_id,
        {
          include:
            normalizedType === "rental"
              ? [
                  { model: models.User, as: "renter" },
                  { model: models.Listing, include: ["owner"] },
                ]
              : [
                  { model: models.User, as: "buyer" },
                  { model: models.User, as: "seller" }, // Assuming seller association exists
                  { model: models.User, as: "owner" }, // Fallback if seller isn't set
                  { model: models.ItemForSale },
                ],
        }
      );

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Determine reported user ID more robustly
      let reportedUserId;
      if (normalizedType === "rental") {
        // Reporter is either the renter or the listing owner
        reportedUserId =
          transaction.renter_id === reporterId
            ? transaction.Listing?.owner_id
            : transaction.renter_id;
      } else {
        const buyerId = transaction.buyer_id;
        const sellerId = transaction.seller_id || transaction.owner_id;

        if (reporterId === buyerId) {
          reportedUserId = sellerId;
        } else if (reporterId === sellerId) {
          reportedUserId = buyerId;
        } else {
          return res
            .status(400)
            .json({ error: "Reporter is not part of this sale transaction." });
        }
      }

      const existingReport = await models.TransactionReport.findOne({
        where: {
          reporter_id: reporterId,
          rental_transaction_id: transaction_id,
        },
      });

      if (existingReport) {
        return res
          .status(400)
          .json({ error: "You've already reported this transaction" });
      }

      if (!reportedUserId) {
        console.error(
          "Could not determine reported user for transaction:",
          transaction_id,
          "type:",
          normalizedType
        );
        return res
          .status(400)
          .json({ error: "Could not determine the user to be reported" });
      }

      const reportData = {
        reporter_id: reporterId,
        reported_id: reportedUserId,
        report_description: reason,
        status: "open",
        transaction_type: normalizedType,
        rental_transaction_id: transaction_id,
      };

      const report = await models.TransactionReport.create(reportData);

      // Handle file uploads
      let evidence = [];
      if (files && files.length > 0) {
        evidence = await Promise.all(
          files.map((file) =>
            models.TransactionEvidence.create({
              transaction_report_id: report.id,
              file_path: file.path,
              uploaded_by_id: reporterId,
            })
          )
        );
      }

      // Create notification for the reported user
      const notification = await models.StudentNotification.create({
        sender_id: reporterId,
        recipient_id: reportedUserId,
        type: "transaction_report",
        message: `A new ${normalizedType} report has been filed against you regarding transaction #${transaction_id}.`,
        transaction_report_id: report.id,
        transaction_id: transaction_id, // Include transaction ID for context
      });

      if (emitNotification) {
        emitNotification(reportedUserId, notification.toJSON());
      }

      // Fetch the created report with associations to return full details
      const fullReport = await models.TransactionReport.findByPk(report.id, {
        include: [
          {
            model: models.User,
            as: "reporter",
            attributes: ["user_id", "first_name", "last_name"],
          },
          {
            model: models.User,
            as: "reported",
            attributes: ["user_id", "first_name", "last_name"],
          },
          { model: models.TransactionEvidence, as: "evidence" },
        ],
      });

      res.status(201).json({ report: fullReport, evidence }); // Return the full report object
    } catch (error) {
      console.error("Error in createTransactionReport:", error);
      res.status(500).json({ error: error.message });
    }
  };
