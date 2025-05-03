const { models, sequelize } = require("../../models");

module.exports =
  ({ emitNotification }) =>
  async (req, res) => {
    const dbTransaction = await sequelize.transaction();

    try {
      const { reportId } = req.params;
      const adminUserId = req.adminUser?.adminId;
      const { newStatus, resolutionNotes, actionTaken } = req.body;

      // *** Validation ***
      if (!adminUserId) {
        await dbTransaction.rollback();
        return res
          .status(403)
          .json({ error: "Forbidden: Admin privileges required." });
      }
      const validAdminStatuses = [
        "admin_review",
        "admin_resolved",
        "admin_dismissed",
      ];
      const validActions = [
        "none",
        "warning_issued",
        "temp_ban_24h",
        "perm_ban",
      ];
      if (!newStatus || !validAdminStatuses.includes(newStatus)) {
        await dbTransaction.rollback();
        return res.status(400).json({
          error: `Invalid status provided. Must be one of: ${validAdminStatuses.join(
            ", "
          )}`,
        });
      }
      if (
        newStatus === "admin_resolved" &&
        (!actionTaken || !validActions.includes(actionTaken))
      ) {
        await dbTransaction.rollback();
        return res.status(400).json({
          error: `Invalid or missing actionTaken for resolved status. Must be one of: ${validActions.join(
            ", "
          )}`,
        });
      }
      if (
        (newStatus === "admin_resolved" || newStatus === "admin_dismissed") &&
        !resolutionNotes?.trim()
      ) {
        await dbTransaction.rollback();
        return res.status(400).json({
          error: `Resolution notes are required when resolving or dismissing a report.`,
        });
      }

      // Fetch Report within transaction
      const report = await models.TransactionReport.findByPk(reportId, {
        include: [
          { model: models.User, as: "reporter", attributes: ["user_id"] },
          {
            model: models.User,
            as: "reported",
            attributes: ["user_id"], // Include user_id to find the student
            include: [{ model: models.Student, as: "student" }], // Include student directly
          },
        ],
        transaction: dbTransaction,
      });

      if (!report) {
        await dbTransaction.rollback();
        return res.status(404).json({ error: "Report not found." });
      }
      if (!["escalated", "admin_review"].includes(report.status)) {
        await dbTransaction.rollback();
        return res.status(400).json({
          error: `Report status is '${report.status}', cannot perform admin action.`,
        });
      }

      // Update Report within transaction
      const updateData = {
        status: newStatus,
        resolved_by_admin_id: adminUserId,
        admin_resolution_notes:
          resolutionNotes || report.admin_resolution_notes,
        admin_action_taken:
          newStatus === "admin_resolved"
            ? actionTaken
            : newStatus === "admin_review"
            ? report.admin_action_taken
            : null,
      };
      await report.update(updateData, { transaction: dbTransaction });

      // *** BAN LOGIC (Modified for 'restricted' status) ***
      let studentUpdateData = {};
      let banNotificationMessage = "";

      // Ensure student data is available before attempting updates
      if (
        newStatus === "admin_resolved" &&
        actionTaken &&
        report.reported?.student
      ) {
        const student = report.reported.student;
        const statusMessageBase = `Due to transaction report #${report.id}: ${
          resolutionNotes || "Admin action taken."
        }`;

        switch (actionTaken) {
          case "perm_ban":
            // console.log(`Applying PERM_BAN to user ${report.reported_id}`);
            studentUpdateData = {
              status: "banned", // Set status to 'banned'
              restricted_until: null, // Clear restriction date
              status_message: `Account permanently banned. ${statusMessageBase}`,
            };
            banNotificationMessage = `Your account has been permanently banned based on transaction report #${
              report.id
            }. Reason: ${resolutionNotes || "Admin decision."}`;
            break;

          case "temp_ban_24h":
            // console.log(`Applying TEMP_BAN_24H to user ${report.reported_id}`);
            const restrictionEndTime = new Date(
              Date.now() + 24 * 60 * 60 * 1000
            );
            studentUpdateData = {
              status: "restricted", // --- Use 'restricted' status ---
              restricted_until: restrictionEndTime, // Set expiry time
              status_message: `Account restricted until ${restrictionEndTime.toLocaleString()}. ${statusMessageBase}`,
            };
            banNotificationMessage = `Your account has been temporarily restricted until ${restrictionEndTime.toLocaleString()} based on transaction report #${
              report.id
            }. Reason: ${resolutionNotes || "Admin decision."}`;
            break;

          case "warning_issued":
            // console.log(`Issuing WARNING to user ${report.reported_id}`);
            studentUpdateData = {
              // status: 'flagged', // Optionally set to 'flagged' for warnings? Or keep 'verified'? Depends on policy.
              // restricted_until: null, // Ensure restriction is cleared if only warning
              status_message: `Warning issued. ${statusMessageBase}`,
            };
            banNotificationMessage = `You have received a warning regarding transaction report #${report.id}.`;
            break;

          case "none":
            // console.log(`Taking NO ACTION against user ${report.reported_id}`);
            studentUpdateData = {
              // status: 'verified', // Potentially revert status if resolving positively and user was restricted/flagged?
              // restricted_until: null, // Clear restriction
              status_message: `Case resolved with no action taken. ${statusMessageBase}`,
            };
            banNotificationMessage = `Transaction report #${
              report.id
            } involving you has been reviewed by an admin and resolved with no further action required. Notes: ${
              resolutionNotes || "None"
            }`;
            break;
        }

        if (Object.keys(studentUpdateData).length > 0) {
          // console.log("Updating student:", studentUpdateData);
          await student.update(studentUpdateData, {
            transaction: dbTransaction,
          });
        }
      } else if (newStatus === "admin_dismissed" && report.reported?.student) {
        // Logic for dismissal (potentially clearing flags/restrictions)
        const student = report.reported.student;
        studentUpdateData = {
          // status: 'verified', // Or keep current if it was 'verified'?
          // restricted_until: null, // Clear restriction if dismissed
          status_message: `Transaction report #${
            report.id
          } dismissed by admin. ${resolutionNotes || ""}`,
        };
        await student.update(studentUpdateData, {
          transaction: dbTransaction,
        });
        banNotificationMessage = `Transaction report #${
          report.id
        } involving you has been dismissed by an admin. Notes: ${
          resolutionNotes || "None"
        }`;
      }
      const notifyMessageReporter = `Admin has updated the status of your transaction report #${reportId} to '${newStatus}'.`;
      const notifyMessageReported =
        banNotificationMessage ||
        `An admin has reviewed transaction report #${reportId} involving you.`;

      if (emitNotification) {
        if (report.reporter_id) {
          await models.StudentNotification.create(
            {
              sender_id: adminUserId,
              recipient_id: report.reporter_id,
              type: "admin_report_update",
              message: notifyMessageReporter,
              transaction_report_id: report.id,
            },
            { transaction: dbTransaction }
          );
        }
        if (report.reported_id) {
          await models.StudentNotification.create(
            {
              sender_id: adminUserId,
              recipient_id: report.reported_id,
              type: "admin_report_update",
              message: notifyMessageReported,
              transaction_report_id: report.id,
            },
            { transaction: dbTransaction }
          );
        }
      }

      await dbTransaction.commit();

      if (emitNotification) {
        if (report.reporter_id) {
          // Fetch the notification to get its ID if needed for emission
          const notifReporter = await models.StudentNotification.findOne({
            where: {
              transaction_report_id: report.id,
              recipient_id: report.reporter_id,
              type: "admin_report_update",
            },
            order: [["createdAt", "DESC"]],
          });
          if (notifReporter)
            emitNotification(report.reporter_id, notifReporter.toJSON());
        }
        if (report.reported_id) {
          const notifReported = await models.StudentNotification.findOne({
            where: {
              transaction_report_id: report.id,
              recipient_id: report.reported_id,
              type: "admin_report_update",
            },
            order: [["createdAt", "DESC"]],
          });
          if (notifReported)
            emitNotification(report.reported_id, notifReported.toJSON());
        }
      }

      // Fetch the updated report again outside the transaction for the response
      const updatedReport = await models.TransactionReport.findByPk(reportId, {
        include: [
          {
            model: models.User,
            as: "reporter",
            attributes: ["user_id", "first_name"],
          },
          {
            model: models.User,
            as: "reported",
            attributes: ["user_id", "first_name"],
            include: [
              {
                model: models.Student,
                as: "student",
                attributes: ["status", "restricted_until"],
              },
            ],
          },
          {
            model: models.User,
            as: "resolvedByAdmin",
            attributes: ["user_id", "first_name"],
          },
        ],
      });
      res.status(200).json({
        message: "Report status updated successfully by admin.",
        updatedReport: updatedReport,
      });
    } catch (error) {
      // *** Rollback Transaction on Error ***
      await dbTransaction.rollback();
      console.error("Error updating escalated report status by admin:", error);
      res.status(500).json({
        error: "Failed to update report status",
        details: error.message,
      });
    }
  };
