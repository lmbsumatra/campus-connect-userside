const { Server } = require("socket.io");
const { getServerUrl } = require("./getServerUrl.js");
const MessageNotification = require("./models/MessageNotificationModel.js");
const StudentNotification = require("./models/StudentNotificationModel.js");

// Function to calculate unread messages for a user
async function calculateUnreadMessages(userId) {
  try {
    const result = await MessageNotification.findAndCountAll({
      where: {
        recipient_id: userId,
        is_read: false,
      },
    });
    return result.count;
  } catch (err) {
    console.error("Error calculating unread messages:", err);
    return 0;
  }
}

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", getServerUrl],
      methods: ["GET", "POST"],
    },
  });

  const adminSockets = new Set();
  const userSockets = new Map();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Track admin connections
    socket.on("admin-connect", () => {
      adminSockets.add(socket.id);
      console.log(
        "Admin connected. Current admin sockets:",
        Array.from(adminSockets)
      );
    });

    // Handle listing notifications
    socket.on("new-listing-notification", (notification) => {
      console.log("Received new listing notification:", notification);
      console.log(
        "Current admin sockets when receiving listing:",
        Array.from(adminSockets)
      );
      notifyAdmins(notification);
    });

    // Handle item-for-sale notifications
    socket.on("new-item-for-sale-notification", (notification) => {
      console.log("Received new item-for-sale notification:", notification);
      console.log(
        "Current admin sockets when receiving item-for-sale:",
        Array.from(adminSockets)
      );
      notifyAdmins(notification);
    });

    // Handle post notifications
    socket.on("new-post", (notification) => {
      console.log("Received new post notification:", notification);
      console.log(
        "Current admin sockets when receiving post:",
        Array.from(adminSockets)
      );
      notifyAdmins(notification);
    });

    // Register the userId to socket mapping
    socket.on("registerUser", async (userId) => {
      try {
        const userIdStr = userId.toString(); // Convert to string
        userSockets.set(userIdStr, socket.id);
        socket.join(userIdStr); // Join room using string ID
        console.log(
          `User ${userIdStr} registered with socket ID ${socket.id} and joined room ${userIdStr}`
        );

        const rooms = Array.from(socket.rooms);
        console.log(`Current rooms for user ${userIdStr}:`, rooms);

        // Calculate and send initial unread count
        const unreadCount = await calculateUnreadMessages(userId);
        socket.emit("updateBadgeCount", unreadCount);
      } catch (error) {
        console.error(`Error registering user ${userId}:`, error);
      }
    });

    //Handle student notification events
    socket.on("sendNotification", async (notificationData) => {
      console.log("🔔 Received sendNotification event:", notificationData);
      try {
        const notificationPayload = {
          sender_id: notificationData.sender,
          recipient_id: notificationData.recipient,
          type: notificationData.type,
          message: notificationData.message,
          is_read: false,
          rental_id: notificationData.rental_id || null,
        };

        console.log("Creating notification with payload:", notificationPayload);

        const notification = await StudentNotification.create(
          notificationPayload
        );
        console.log(
          "✅ Notification saved to database:",
          notification.toJSON()
        );

        // Emit to the recipient's room using their user ID
        io.to(notificationData.recipient.toString()).emit(
          "receiveNotification",
          notification.toJSON()
        );
        console.log(
          `✅ Notification emitted to room: ${notificationData.recipient}`
        );
      } catch (error) {
        console.error("❌ Error handling sendNotification event:", error);
      }
    });

    // Listen for messages and send them to the recipient
    socket.on("sendMessageToUser", async (data) => {
      const { sender, recipient, text, conversationId } = data;
      console.log(`Message from user ${sender} to user ${recipient}: ${text}`);

      try {
        // Prevent self-notification
        if (sender === recipient) {
          console.log("Prevented self-notification");
          return;
        }

        // Create notification for recipient
        await MessageNotification.create({
          recipient_id: recipient,
          sender_id: sender,
          message: text,
          conversation_id: conversationId,
          is_read: false,
        });

        // Look up the recipient's socket.id
        const recipientSocketId = userSockets.get(recipient);

        if (recipientSocketId) {
          // Send message to recipient
          io.to(recipientSocketId).emit("receiveMessage", {
            sender,
            text,
            conversationId,
            otherUser: { userId: sender },
            timestamp: new Date(),
          });
          console.log(`Message sent to user ${recipient}`);

          // Update badge count
          const unreadCount = await MessageNotification.count({
            where: { recipient_id: recipient, is_read: false },
          });
          console.log(`Unread count for user ${recipient}:`, unreadCount);
          io.to(recipientSocketId).emit("updateBadgeCount", unreadCount);
        } else {
          console.log(`User ${recipient} not connected`);
          // Notification is already created above, even if user is offline
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    });
    // Handle marking messages as read
    socket.on("markMessagesAsRead", async (data) => {
      const { userId, conversationId, notificationId } = data;
      try {
        let whereClause = {
          recipient_id: userId,
          is_read: false,
        };

        // If specific conversation, add to where clause
        if (conversationId && conversationId !== "all") {
          whereClause.conversation_id = conversationId;
        }

        // If specific notification, update only that one
        if (notificationId) {
          whereClause.id = notificationId;
        }

        await MessageNotification.update(
          { is_read: true },
          { where: whereClause }
        );

        // Recalculate and send updated badge count
        const unreadCount = await calculateUnreadMessages(userId);
        const userSocketId = userSockets.get(userId);
        if (userSocketId) {
          io.to(userSocketId).emit("updateBadgeCount", unreadCount);
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Clean up on disconnect
    socket.on("disconnect", () => {
      adminSockets.delete(socket.id);
      userSockets.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`User ${userId} disconnected`);
        }
      });
      console.log(
        "Client disconnected. Remaining admin sockets:",
        Array.from(adminSockets)
      );
    });
  });

  // Function to notify all connected admins
  const notifyAdmins = (notification) => {
    console.log("Sending notification to admins:", notification);
    console.log("Number of admin sockets:", adminSockets.size);

    const eventName =
      notification.type === "new-item-for-sale"
        ? "new-item-for-sale-notification"
        : notification.type === "new-post"
        ? "new-post-notification"
        : "new-listing-notification";

    // Emit notification to all connected admins
    adminSockets.forEach((socketId) => {
      console.log(`Emitting ${eventName} to socket ${socketId}`);
      io.to(socketId).emit(eventName, notification);
    });
  };

  // Notification emitter for users (using rooms)
  const emitNotification = (recipientId, notification) => {
    const recipientStr = recipientId.toString();
    try {
      io.to(recipientStr).emit("receiveNotification", notification);
      console.log(`✅ Notification sent to user ${recipientStr}'s room`);
    } catch (error) {
      console.error("❌ Error emitting user notification:", error);
    }
  };

  return { io, notifyAdmins, emitNotification };
}

module.exports = { initializeSocket };
