const { models } = require("../models/index");
const sequelize = require("../../backend/config/database");
const { Op } = require("sequelize");

module.exports = ({ emitNotification }) => {
  const createTransactionReport = async (req, res) => {
    try {
      const { transaction_id, transaction_type, reason } = req.body;
      const files = req.files || []; // Ensure files is an array
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
        // 'sell' type
        // Determine seller and buyer IDs
        const buyerId = transaction.buyer_id;
        // Prefer seller_id if explicitly set, otherwise fallback to owner_id (associated via ItemForSale)
        const sellerId = transaction.seller_id || transaction.owner_id;

        // console.log(`Sell Tx: Buyer=${buyerId}, Seller=${sellerId}, Reporter=${reporterId}`);

        // Reportee is the other party in the transaction
        if (reporterId === buyerId) {
          reportedUserId = sellerId;
        } else if (reporterId === sellerId) {
          reportedUserId = buyerId;
        } else {
          // Edge case: If the reporter is neither buyer nor seller (e.g., admin initiating?), handle appropriately.
          // For now, assume reporter must be one of the parties.
          return res
            .status(400)
            .json({ error: "Reporter is not part of this sale transaction." });
        }
      }

      // console.log("Transaction:", JSON.stringify(transaction, null, 2));
      // console.log("Reporter ID:", reporterId);
      // console.log("Reported User ID:", reportedUserId);
      // console.log("Transaction type:", normalizedType);

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
        // Correctly link based on the type if your model structure demands it
        rental_transaction_id: transaction_id, // Assuming rental_transaction_id covers both rental and sell
        // Or potentially use separate keys like:
        // ...(normalizedType === 'rental' ? { rental_transaction_id: transaction_id } : {}),
        // ...(normalizedType === 'sell' ? { sale_transaction_id: transaction_id } : {}), // If you add sale_transaction_id
      };

      const report = await models.TransactionReport.create(reportData);

      // Handle file uploads
      let evidence = [];
      if (files && files.length > 0) {
        evidence = await Promise.all(
          files.map((file) =>
            models.TransactionEvidence.create({
              transaction_report_id: report.id,
              file_path: file.path, // Ensure multer saves the path correctly
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

  const addResponse = async (req, res) => {
    try {
      const { reportId } = req.params;
      const { response: responseText } = req.body;
      const files = req.files || []; // Ensure files is an array
      const responderUserId = req.user.userId; // Use the authenticated user's ID

      const report = await models.TransactionReport.findByPk(reportId, {
        include: [
          // Include associated users to determine roles
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
        // evidence: evidenceRecords, // Redundant if included in fullResponse
        updatedReportStatus:
          report.status === "open" ? "under_review" : report.status, // Inform client of potential status change
      });
    } catch (error) {
      console.error("Error in addResponse:", error);
      return res.status(500).json({ error: error.message });
    }
  };

  // Fetch all reports
  const getAllTransactionReports = async (req, res) => {
    try {
      const reports = await models.TransactionReport.findAll({
        include: [
          // Reporter User + Student Profile Pic
          {
            model: models.User,
            as: "reporter",
            attributes: ["user_id", "first_name", "last_name"],
            include: [
              {
                model: models.Student,
                as: "student",
                attributes: ["profile_pic"],
                required: false,
              },
            ],
          },
          // Reported User + Student Profile Pic
          {
            model: models.User,
            as: "reported",
            attributes: ["user_id", "first_name", "last_name"],
            include: [
              {
                model: models.Student,
                as: "student",
                attributes: ["profile_pic"],
                required: false,
              },
            ],
          },
          // Evidence
          {
            model: models.TransactionEvidence,
            as: "evidence",
            attributes: ["id", "file_path", "uploaded_by_id"],
            required: false,
          },
          // Rental Transaction (Corrected Attributes)
          {
            model: models.RentalTransaction,
            as: "rentalTransaction",
            // Select only columns that exist in rental_transactions table
            attributes: ["id", "item_id", "transaction_type"], // REMOVED listing_id, item_for_sale_id
            required: false,
            include: [
              // These nested includes are correct and use item_id for joining
              {
                model: models.Listing,
                attributes: ["id", "listing_name"],
                required: false,
              },
              {
                model: models.ItemForSale,
                attributes: ["id", "item_for_sale_name"],
                required: false,
              },
            ],
          },
          // Responses (Limited)
          {
            model: models.TransactionReportResponse,
            as: "responses",
            attributes: ["id", "user_id", "createdAt"],
            limit: 1,
            order: [["createdAt", "DESC"]],
            required: false,
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(reports);
    } catch (error) {
      console.error("Error fetching all transaction reports:", error);
      res.status(500).json({
        error: "Failed to retrieve transaction reports",
        details: error.message,
      });
    }
  };
  const getEscalatedTransactionReports = async (req, res) => {
    try {
      const reports = await models.TransactionReport.findAll({
        where: {
          status: {
            [Op.or]: ["escalated", "admin_review"], // Fetch reports escalated OR already under admin review
          },
        },
        // Include necessary details for the admin queue view
        include: [
          {
            model: models.User,
            as: "reporter",
            attributes: ["user_id", "first_name", "last_name"],
            include: [
              {
                model: models.Student,
                as: "student",
                attributes: ["profile_pic"],
                required: false,
              },
            ],
          },
          {
            model: models.User,
            as: "reported",
            attributes: ["user_id", "first_name", "last_name"],
            include: [
              {
                model: models.Student,
                as: "student",
                attributes: ["profile_pic"],
                required: false,
              },
            ],
          },
          // Maybe include transaction details briefly
          {
            model: models.RentalTransaction,
            as: "rentalTransaction",
            attributes: ["id", "item_id", "transaction_type"],
            required: false,
            include: [
              {
                model: models.Listing,
                attributes: ["id", "listing_name"],
                required: false,
              },
              {
                model: models.ItemForSale,
                attributes: ["id", "item_for_sale_name"],
                required: false,
              },
            ],
          },
        ],
        order: [["createdAt", "ASC"]], // Process older escalated reports first
      });
      res.status(200).json(reports);
    } catch (error) {
      console.error("Error fetching escalated transaction reports:", error);
      res.status(500).json({
        error: "Failed to retrieve escalated reports",
        details: error.message,
      });
    }
  };

  const getTransactionReportById = async (req, res) => {
    try {
      const { reportId } = req.params;
      const userId = req.user?.userId;
      const adminId = req.adminUser?.adminId;

      const report = await models.TransactionReport.findByPk(reportId, {
        include: [
          // Reporter User + Profile
          {
            model: models.User,
            as: "reporter",
            attributes: ["user_id", "first_name", "last_name"],
            include: [
              {
                model: models.Student,
                as: "student",
                attributes: ["profile_pic"],
                required: false,
              },
            ],
          },
          // Reported User + Profile
          {
            model: models.User,
            as: "reported",
            attributes: ["user_id", "first_name", "last_name"],
            include: [
              {
                model: models.Student,
                as: "student",
                attributes: ["profile_pic"],
                required: false,
              },
            ],
          },
          // Admin Resolver + Profile
          {
            model: models.User,
            as: "resolvedByAdmin",
            attributes: ["user_id", "first_name", "last_name"],
            include: [
              {
                model: models.Student,
                as: "student",
                attributes: ["profile_pic"],
                required: false,
              },
            ],
            required: false,
          },

          {
            model: models.TransactionEvidence,
            as: "evidence",
            where: { transaction_report_response_id: null },
            required: false,
          },
          // Responses
          {
            model: models.TransactionReportResponse,
            as: "responses",
            required: false,
            include: [
              {
                model: models.User,
                as: "user",
                attributes: ["user_id", "first_name", "last_name"],

                include: [
                  {
                    model: models.Student,
                    as: "student",
                    attributes: ["profile_pic"],
                    required: false,
                  },
                ],
              },

              {
                model: models.TransactionEvidence,
                as: "evidence",
                required: false,
              },
            ],
          },
          // Rental Transaction
          {
            model: models.RentalTransaction,
            as: "rentalTransaction",
            required: false,
            include: [
              {
                model: models.Listing,

                attributes: ["id", "listing_name", "owner_id"],
                required: false,
              },

              {
                model: models.ItemForSale,

                attributes: ["id", "item_for_sale_name", "seller_id"],
                required: false,
              },
            ],
          },
        ],
        order: [
          // Ensure responses are ordered chronologically
          [
            { model: models.TransactionReportResponse, as: "responses" },
            "createdAt",
            "ASC",
          ],
        ],
      });

      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      // Access Control (Admin OR Involved Student)
      const isReporter = userId === report.reporter_id;
      const isReported = userId === report.reported_id;
      const isAdmin = !!adminId;

      if (!isAdmin && !isReporter && !isReported) {
        return res.status(403).json({
          error: "Forbidden: You do not have permission to view this report.",
        });
      }
      return res.status(200).json(report);
    } catch (error) {
      console.error("Error in getTransactionReportById:", error);
      res.status(500).json({
        error: "Failed to retrieve report details",
        details: error.message,
      });
    }
  };

  const markReportResolved = async (req, res) => {
    try {
      const { reportId } = req.params;
      const reporterUserId = req.user.userId; // Get the ID of the user making the request

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

  const escalateReport = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { reportId } = req.params;
      const reporterUserId = req.user.userId; // Get the ID of the user making the request

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
        if (req.emitNotification) {
          req.emitNotification(
            report.reported_id,
            notificationToReported.toJSON()
          );
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

  // --- Admin action on an escalated report ---
  const updateEscalatedReportStatusByAdmin = async (req, res) => {
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
            console.log(`Applying PERM_BAN to user ${report.reported_id}`);
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
            console.log(`Applying TEMP_BAN_24H to user ${report.reported_id}`);
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
            console.log(`Issuing WARNING to user ${report.reported_id}`);
            studentUpdateData = {
              // status: 'flagged', // Optionally set to 'flagged' for warnings? Or keep 'verified'? Depends on policy.
              // restricted_until: null, // Ensure restriction is cleared if only warning
              status_message: `Warning issued. ${statusMessageBase}`,
            };
            banNotificationMessage = `You have received a warning regarding transaction report #${report.id}.`;
            break;

          case "none":
            console.log(`Taking NO ACTION against user ${report.reported_id}`);
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
          console.log("Updating student:", studentUpdateData);
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

  return {
    createTransactionReport,
    addResponse,
    getAllTransactionReports,
    getEscalatedTransactionReports,
    getTransactionReportById,
    markReportResolved, // Student action
    escalateReport, // Student action
    updateEscalatedReportStatusByAdmin, // Admin action
  };
};
