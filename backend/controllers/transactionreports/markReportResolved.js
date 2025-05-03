const { Op } = require("sequelize");
const { models } = require("../../models");

module.exports =
  ({ emitNotification }) =>
  async (req, res) => {
    try {
      const { reportId } = req.params;
      const reporterUserId = req.user.userId;

      const report = await models.TransactionReport.findByPk(reportId, {
        include: [
          // Include reported user for notification
          { model: models.User, as: "reported", attributes: ["user_id"] },
        ],
      });

      if (!report) return res.status(404).json({ error: "Report not found" });

      // Authorization: Ensure only the original reporter can mark it as resolved
      if (reporterUserId !== report.reporter_id) {
        return res.status(403).json({
          error:
            "Unauthorized: Only the reporter can mark this report as resolved.",
        });
      }

      // Check if the report is already resolved or escalated
      if (report.status === "resolved") {
        return res
          .status(400)
          .json({ error: "Report is already marked as resolved." });
      }
      if (report.status === "escalated") {
        return res.status(400).json({
          error: "Cannot resolve an escalated report. Admin action required.",
        });
      }

      await report.update({ status: "resolved" });

      // Create notification for the reported user
      if (report.reported_id) {
        // Ensure reported_id exists
        const notification = await models.StudentNotification.create({
          sender_id: report.reporter_id, // Action performed by the reporter
          recipient_id: report.reported_id, // Notify the person who was reported
          type: "report_resolved",
          message: `The transaction report (ID: ${report.id}) filed against you has been marked as resolved by the reporter.`,
          transaction_report_id: report.id,
        });

        // Emit notification in real-time if service is available
        if (emitNotification) {
          emitNotification(report.reported_id, notification.toJSON());
        }
      }

      return res.status(200).json({
        message: "Report successfully marked as resolved",
        newStatus: "resolved",
      });
    } catch (error) {
      console.error("Error marking report as resolved:", error);
      res.status(500).json({ error: error.message });
    }
  };
