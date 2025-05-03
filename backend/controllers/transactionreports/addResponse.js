const { Op } = require("sequelize");
const { models } = require("../../models");

module.exports =
  ({ emitNotification }) =>
  async (req, res) => {
    try {
      const { reportId } = req.params;
      const { response: responseText } = req.body;
      const files = req.files || [];
      const responderUserId = req.user.userId;

      const report = await models.TransactionReport.findByPk(reportId, {
        include: [
          { model: models.User, as: "reporter", attributes: ["user_id"] },
          { model: models.User, as: "reported", attributes: ["user_id"] },
        ],
      });

      if (!report) return res.status(404).json({ error: "Report not found" });

      // Authorization: Only reporter or reported user can add a response
      if (
        responderUserId !== report.reporter_id &&
        responderUserId !== report.reported_id
      ) {
        return res
          .status(403)
          .json({ error: "Unauthorized: You cannot respond to this report." });
      }

      // Check if the report is already resolved or escalated
      if (report.status === "resolved" || report.status === "escalated") {
        return res.status(400).json({
          error: `Cannot add response. Report is already ${report.status}.`,
        });
      }

      const existingResponse = await models.TransactionReportResponse.findOne({
        where: {
          transaction_report_id: report.id,
          user_id: responderUserId,
        },
      });

      if (existingResponse) {
        return res
          .status(400)
          .json({ error: "You've already responded to this report" });
      }

      const newResponse = await models.TransactionReportResponse.create({
        transaction_report_id: report.id,
        user_id: responderUserId, // Save who made the response
        response_text: responseText,
      });

      // Handle evidence uploads associated with this response
      let evidenceRecords = [];
      if (files && files.length > 0) {
        evidenceRecords = await Promise.all(
          files.map((file) =>
            models.TransactionEvidence.create({
              transaction_report_id: report.id,
              transaction_report_response_id: newResponse.id, // Link evidence to the response
              file_path: file.path,
              uploaded_by_id: responderUserId, // Save who uploaded the evidence
            })
          )
        );
      }

      // Update report status to 'under_review' if it was 'open'
      if (report.status === "open") {
        await report.update({ status: "under_review" });
      }

      // Determine the recipient of the notification (the *other* party)
      const recipientId =
        responderUserId === report.reporter_id
          ? report.reported_id
          : report.reporter_id;

      // Create notification for the *other* party involved in the report
      const notification = await models.StudentNotification.create({
        sender_id: responderUserId,
        recipient_id: recipientId,
        type: "transaction_report_response",
        message: `The person involved with the ${report.transaction_type} transaction you reported has reponded to your report (ID: ${report.id}).`,
        transaction_report_id: report.id,
      });

      if (emitNotification && recipientId) {
        emitNotification(recipientId, notification.toJSON());
      }

      // Fetch the new response with associated evidence to return
      const fullResponse = await models.TransactionReportResponse.findByPk(
        newResponse.id,
        {
          include: [{ model: models.TransactionEvidence, as: "evidence" }],
        }
      );

      return res.status(201).json({
        message: "Response added successfully",
        response: fullResponse, // Return the response with its evidence
        updatedReportStatus:
          report.status === "open" ? "under_review" : report.status, // Inform client of potential status change
      });
    } catch (error) {
      console.error("Error in addResponseToReport:", error);
      return res.status(500).json({ error: error.message });
    }
  };
