const { Op } = require("sequelize");
const { models } = require("../../models");
const sequelize = require("../../config/database");

module.exports =
  ({ emitNotification }) =>
  async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { reportId } = req.params;
      const reporterUserId = req.user.userId;

      const report = await models.TransactionReport.findByPk(reportId, {
        include: [
          // Include reported user for notification
          {
            model: models.User,
            as: "reported",
            attributes: ["user_id", "first_name", "last_name"],
          },
          // Include reporter user for notification
          {
            model: models.User,
            as: "reporter",
            attributes: ["user_id", "first_name", "last_name"],
          },
        ],
        transaction,
      });

      if (!report) {
        await transaction.rollback();
        return res.status(404).json({ error: "Report not found" });
      }

      // Authorization: Ensure only the original reporter can escalate the report
      if (reporterUserId !== report.reporter_id) {
        await transaction.rollback();
        return res.status(403).json({
          error: "Unauthorized: Only the reporter can escalate this report.",
        });
      }

      // Check if the report is already resolved or escalated
      if (report.status === "resolved") {
        await transaction.rollback();
        return res
          .status(400)
          .json({ error: "Cannot escalate a resolved report." });
      }

      if (report.status === "escalated") {
        await transaction.rollback();
        return res.status(400).json({ error: "Report is already escalated." });
      }

      await report.update({ status: "escalated" }, { transaction });

      // Create notification for the reported user
      if (report.reported_id) {
        // Ensure reported_id exists
        const notificationToReported = await models.StudentNotification.create(
          {
            sender_id: report.reporter_id, // Action by the reporter
            recipient_id: report.reported_id, // Notify the reported user
            type: "report_escalated",
            message: `The transaction report (ID: ${report.id}) involving you has been escalated for admin review.`,
            transaction_report_id: report.id,
          },
          { transaction }
        );

        // Emit notification to the reported user if socket is available
        if (emitNotification) {
          emitNotification(report.reported_id, notificationToReported.toJSON());
        }
      }

      // Get reporter details for admin notification
      const reporterName = report.reporter
        ? `${report.reporter.first_name} ${report.reporter.last_name}`
        : "Unknown";

      // Create notification for admins
      const adminNotificationData = {
        type: "escalated-report",
        title: "Transaction Report Escalated",
        message: ` has escalated a transaction report for admin review.`,
        ownerName: reporterName,
        ownerId: report.reporter_id,
        itemId: report.id,
        itemType: "transaction-report",
        timestamp: new Date(),
        isRead: false,
      };

      const adminNotification = await models.Notification.create(
        adminNotificationData,
        { transaction }
      );

      // Commit the transaction
      await transaction.commit();

      // Emit socket event to notify admins after commit
      if (req.notifyAdmins) {
        req.notifyAdmins({
          ...adminNotification.toJSON(),
          owner: {
            id: report.reporter_id,
            name: reporterName,
          },
        });
      }

      return res.status(200).json({
        message: "Report successfully escalated to admin review",
        newStatus: "escalated",
        notification: adminNotification.toJSON(),
      });
    } catch (error) {
      if (transaction.finished !== "commit") {
        await transaction.rollback();
      }

      console.error("Error escalating report:", error);
      res.status(500).json({ error: error.message });
    }
  };
