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
        };

        console.log("📩 Saving notification:", notificationPayload);
        const newNotification = await StudentNotification.create(
          notificationPayload
        );
        console.log("✅ Notification saved:", newNotification.toJSON());

        // Log userSockets map to verify correct socket is retrieved
        console.log("🧐 Current userSockets map:", userSockets);

        // Emit ONLY to the recipient if they are online
        const recipientSocketId = userSockets.get(notificationData.recipient);
        if (recipientSocketId) {
          console.log(
            `🚀 Sending notification to recipient (Socket ID: ${recipientSocketId})`
          );
          io.to(recipientSocketId).emit("receiveNotification", newNotification);
        } else {
          console.log(
            `⚠️ User ${notificationData.recipient} is offline. Notification saved in database only.`
          );
        }
      } catch (err) {
        console.error("❌ Error in sendNotification:", err);
      }
    });

    // Register the userId to socket mapping
    socket.on("registerUser", async (userId) => {
      try {
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ID ${socket.id}`);

        // Calculate and send initial unread count
        const unreadCount = await calculateUnreadMessages(userId);
        socket.emit("updateBadgeCount", unreadCount);
      } catch (error) {
        console.error(`Error registering user ${userId}:`, error);
      }
    });

    // Listen for messages and send them to the recipient
    socket.on("sendMessageToUser", async (data) => {
      const { sender, recipient, text, conversationId } = data;
      console.log(`Message from user ${sender} to user ${recipient}: ${text}`);

      try {
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

          // Create message notification in database
          await MessageNotification.create({
            recipient_id: recipient,
            sender_id: sender,
            message: text,
            conversation_id: conversationId,
            is_read: false,
          });

          // Calculate unread message count and send badge update
          const unreadCount = await calculateUnreadMessages(recipient);
          console.log(`Unread count for user ${recipient}:`, unreadCount);
          io.to(recipientSocketId).emit("updateBadgeCount", unreadCount);
        } else {
          console.log(`User ${recipient} not connected`);
          // Still create notification even if user is offline
          await MessageNotification.create({
            recipient_id: recipient,
            sender_id: sender,
            message: text,
            conversation_id: conversationId,
            is_read: false,
          });
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

  return { io, notifyAdmins };
}

module.exports = { initializeSocket };
