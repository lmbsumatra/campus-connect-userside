const { models } = require("../../models/index");
const StudentNotification = require("../../models/StudentNotificationModel");

const updateListingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user.userId; // Provided by your admin auth middleware

    // Fetch the listing by ID
    const listing = await models.Listing.findByPk(id);s
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // Update the listing’s status
    await listing.update({ status });

    // Define custom messages for each status
    const messages = {
      approved: `Listing approved: ${listing.listing_name}`,
      declined: `Listing declined: ${listing.listing_name}. Reason: ${reason}`,
      removed: `Listing removed: ${listing.listing_name}. Reason: ${reason}`,
      revoked: `Listing reinstated: ${listing.listing_name}`,
      flagged: `Listing flagged: ${listing.listing_name}. Reason: ${reason}`,
    };

    // Create a notification record for the student (listing owner)
    const notification = await StudentNotification.create({
      sender_id: adminId,
      recipient_id: listing.owner_id,
      type: "listing_status",
      message: messages[status] || "Your listing status was updated",
      is_read: false,
      listing_id: listing.id,
    });

    // If available, emit the notification via Socket.IO
    if (req.emitNotification) {
      req.emitNotification(listing.owner_id, notification.toJSON());
    }

    res.json({
      message: "Status updated successfully",
      notification,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = updateListingStatus;
