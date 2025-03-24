const { models } = require("../../models/index");
const StudentNotification = require("../../models/StudentNotificationModel");
const { Op } = require("sequelize");
const sequelize = require("../../config/database"); // Import sequelize for transactions

const updateListingStatus = async (req, res) => {
  const transaction = await sequelize.transaction(); // Start a transaction

  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Check if req.user exists and extract adminId
    const adminId = req.adminUser?.adminId;
    if (!adminId) {
      await transaction.rollback(); // Rollback if unauthorized
      return res
        .status(401)
        .json({ error: "Unauthorized: admin user not found" });
    }

    // Fetch the listing by ID
    const listing = await models.Listing.findByPk(id, { transaction });
    if (!listing) {
      await transaction.rollback(); // Rollback if listing not found
      return res.status(404).json({ error: "Listing not found" });
    }

    // Update the listing's status and status_message
    await listing.update({ 
      status, 
      status_message: reason 
    }, { transaction });

    // Define custom messages for each status
    const messages = {
      approved: `Listing approved: ${listing.listing_name}`,
      declined: `Listing declined: ${listing.listing_name}. Reason: ${reason}`,
      removed: `Listing removed: ${listing.listing_name}. Reason: ${reason}`,
      revoked: `Listing reinstated: ${listing.listing_name}`,
      flagged: `Listing flagged: ${listing.listing_name}. Reason: ${reason}`,
    };

    // Create a notification record for the student (listing owner)
    const notification = await StudentNotification.create(
      {
        sender_id: adminId,
        recipient_id: listing.owner_id,
        type: "listing_status",
        message: messages[status] || "Your listing status was updated",
        is_read: false,
        listing_id: listing.id,
      },
      { transaction }
    );

    // Send notifications to all students when approved
    if (status === "approved") {
      // Retrieve all students except the owner
      const students = await models.User.findAll({
        where: {
          role: "student",
          user_id: { [Op.ne]: listing.owner_id },
        },
        attributes: ["user_id"],
        transaction, // Include transaction in the query
      });

      // Bulk create notifications
      const studentNotifications = await StudentNotification.bulkCreate(
        students.map((student) => ({
          sender_id: listing.owner_id,
          recipient_id: student.user_id,
          type: "new-listing",
          message: `"${listing.listing_name}" is now available!`,
          listing_id: listing.id,
          is_read: false,
        })),
        { transaction } // Include transaction in bulkCreate
      );

      // Emit notifications via Socket.IO
      studentNotifications.forEach((notif) => {
        if (req.emitNotification) {
          req.emitNotification(notif.recipient_id, notif.toJSON());
        }
      });
    }

    // Commit the transaction
    await transaction.commit();

    res.json({
      message: "Status updated successfully",
      notification,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    if (transaction.finished !== "commit") {
      await transaction.rollback();
    }

    // console.error("Error updating status:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = updateListingStatus;