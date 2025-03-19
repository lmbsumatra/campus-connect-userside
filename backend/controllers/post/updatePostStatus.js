const { models } = require("../../models/index");
const StudentNotification = require("../../models/StudentNotificationModel");
const { Op } = require("sequelize");
const sequelize = require("../../config/database");

const updatePostStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Check if req.user exists and extract adminId
    const adminId = req.adminUser?.userId;
    if (!adminId) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ error: "Unauthorized: admin user not found" });
    }

    // Fetch the post by ID
    const post = await models.Post.findByPk(id, { transaction });
    if (!post) {
      await transaction.rollback();
      return res.status(404).json({ error: "Post not found" });
    }

    // // Debug: Log the fetched post
    // console.log("Fetched Post:", post.toJSON());

    // Update the post’s status
    await post.update({ status }, { transaction });

    // Define custom messages for each status
    const messages = {
      approved: `Post approved: ${post.post_item_name}`,
      declined: `Post declined: ${post.post_item_name}. Reason: ${reason}`,
      removed: `Post removed: ${post.post_item_name}. Reason: ${reason}`,
      revoked: `Post reinstated: ${post.post_item_name}`,
      flagged: `Post flagged: ${post.post_item_name}. Reason: ${reason}`,
    };

    // // Debug: Log the status and message
    // console.log("Status:", status);
    // console.log("Message:", messages[status]);

    // Create a notification record for the student (post owner)
    const notification = await StudentNotification.create(
      {
        sender_id: adminId,
        recipient_id: post.user_id,
        type: "post_status",
        message: messages[status] || "Your post status was updated",
        is_read: false,
        post_id: post.id,
      },
      { transaction }
    );

    // // Debug: Log the created notification
    // console.log("Notification created:", notification.toJSON());

    // Send notifications to all students when approved
    if (status === "approved") {
      // Retrieve all students except the owner
      const students = await models.User.findAll({
        where: {
          role: "student",
          user_id: { [Op.ne]: post.user_id },
        },
        attributes: ["user_id"],
        transaction,
      });

      // Get the post owner's name
      const postOwner = await models.User.findByPk(post.user_id, {
        attributes: ["first_name", "last_name"],
        transaction,
      });

      const senderName = postOwner
        ? `${postOwner.first_name} ${postOwner.last_name}`
        : "Someone";

      // Bulk create notifications
      const studentNotifications = await StudentNotification.bulkCreate(
        students.map((student) => ({
          sender_id: post.user_id,
          recipient_id: student.user_id,
          type: "new-post",
          message: `${senderName} is looking for ${post.post_item_name}`,
          post_id: post.id,
          is_read: false,
        })),
        { transaction }
      );

      // Emit notifications via Socket.IO
      studentNotifications.forEach((notif) => {
        if (req.emitNotification) {
          req.emitNotification(notif.recipient_id, notif.toJSON());
        }
      });
    }

    // Commit the transaction
    // console.log("Committing transaction...");
    await transaction.commit();
    // console.log("Transaction committed successfully.");

    res.json({
      message: "Post status updated successfully",
      notification,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    if (transaction.finished !== "commit") {
      // console.log("Rolling back transaction due to error...");
      await transaction.rollback();
    }

    console.error("Error updating post status:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = updatePostStatus;
