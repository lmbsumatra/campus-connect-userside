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
  // Update the cors configuration in initializeSocket function
  const io = new Server(server, {
    cors: {
      origin: ["https://rentupeers.shop", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
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
      //   "Admin connected. Current admin sockets:",
      //   Array.from(adminSockets)
      // );
    });

    // Handle listing notifications
    socket.on("new-listing-notification", (notification) => {
      console.log("Received new listing notification:", notification);
      console.log(
      //   "Current admin sockets when receiving listing:",
      //   Array.from(adminSockets)
      // );
      notifyAdmins(notification);
    });

    // Handle item-for-sale notifications
    socket.on("new-item-for-sale-notification", (notification) => {
      console.log("Received new item-for-sale notification:", notification);
      console.log(
      //   "Current admin sockets when receiving item-for-sale:",
      //   Array.from(adminSockets)
      // );
      notifyAdmins(notification);
    });

    // Handle post notifications
    socket.on("new-post", (notification) => {
      console.log("Received new post notification:", notification);
      console.log(
      //   "Current admin sockets when receiving post:",
      //   Array.from(adminSockets)
      // );
      notifyAdmins(notification);
    });

    // Register the userId to socket mapping
    socket.on("registerUser", async (userId) => {
      try {
        const userIdStr = userId.toString();

        if (!userSockets.has(userIdStr)) {
          userSockets.set(userIdStr, new Set());
        }
        userSockets.get(userIdStr).add(socket.id);

        socket.join(userIdStr); // Join room
        console.log(
        //   `User ${userIdStr} registered with socket ID ${socket.id} and joined room ${userIdStr}`
        // );

        const rooms = Array.from(socket.rooms);
        console.log(`Current rooms for user ${userIdStr}:`, rooms);

        // Send unread count
        const unreadCount = await calculateUnreadMessages(userId);
        socket.emit("updateBadgeCount", unreadCount);
      } catch (error) {
        console.error(`Error registering user ${userId}:`, error);
      }
    });

    //Handle student notification events
    socket.on("sendNotification", async (notificationData) => {
      console.log("Received sendNotification event:", notificationData);
      try {
        const notificationPayload = {
          sender_id: notificationData.sender,
          recipient_id: notificationData.recipient,
          type: notificationData.type,
          message: notificationData.message,
          is_read: false,
          rental_id: notificationData.rental_id || null,
          rental_report_id: notificationData.rental_report_id || null,
        };

        console.log("Creating notification with payload:", notificationPayload);

        const notification = await StudentNotification.create(
          notificationPayload
        );
        console.log(
        //   "Notification saved to database:",
        //   notification.toJSON()
        // );

        // Emit to the recipient's room using their user ID
        io.to(notificationData.recipient.toString()).emit(
          "receiveNotification",
          notification.toJSON()
        );
        console.log(
        //   `Notification emitted to room: ${notificationData.recipient}`
        // );
      } catch (error) {
        console.error("Error handling sendNotification event:", error);
      }
    });

    socket.on("new-listing-notification", (notification) => {
      // Emit to all students except the listing owner
      const recipientStr = notification.recipient_id.toString();
      io.to(recipientStr).emit("receiveNotification", notification);
    });

    // Listen for messages and send them to the recipient
    socket.on("sendMessageToUser", async (data) => {
      const {
        sender,
        recipient,
        text,
        images,
        conversationId,
        isProductCard,
        productDetails,
      } = data;
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

        //s Convert recipient to string to match how it's stored in the Map
        const recipientStr = recipient.toString();

        // Prepare the message data to send
        const messageData = {
          sender,
          text,
          images: images || [],
          conversationId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isProductCard: data.isProductCard || false,
          productDetails: data.productDetails || null,
        };

        //e Send message to the recipient's room
        io.to(recipientStr).emit("receiveMessage", messageData);
        console.log(`Message sent to user ${recipientStr}'s room`);

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

    // Handle block user events
    socket.on("blockUser", (data) => {
      const { blockerId, blockedId } = data;

      if (blockerId === blockedId) {
        console.log("Prevented self-blocking notification");
        return;
      }

      try {
        // Convert blockedId to string to match how it's stored in the Map
        const blockedIdStr = blockedId.toString();

        // Notify the blocked user about being blocked
        io.to(blockedIdStr).emit("userBlocked", {
          blockerId,
          blockedId,
        });

        console.log(`Block notification sent to user ${blockedIdStr}`);
      } catch (error) {
        console.error("Error handling block user event:", error);
      }
    });

    // Handle unblock user events
    socket.on("unblockUser", (data) => {
      const { unblockerId, unblockedId } = data;

      if (unblockerId === unblockedId) {
        console.log("Prevented self-unblocking notification");
        return;
      }

      try {
        // Convert unblockedId to string to match how it's stored in the Map
        const unblockedIdStr = unblockedId.toString();

        // Notify the unblocked user about being unblocked
        io.to(unblockedIdStr).emit("userUnblocked", {
          unblockerId,
          unblockedId,
        });

        console.log(`Unblock notification sent to user ${unblockedIdStr}`);
      } catch (error) {
        console.error("Error handling unblock user event:", error);
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

    // handle trigger on transaction update status
    socket.on("update-transaction-status", (data) => {
      const { rentalId, sender, recipient, status } = data;
      console.log(
      //   `Rental update for rental ${rentalId}: Status changed to ${status} sender${sender} receiver${recipient}`
      // );

      try {
        if (sender === recipient) {
          console.log("Self-notification prevented.");
          return;
        }

        console.log(data);
        const recipientSockets = userSockets.get(recipient.toString());

        if (recipientSockets && recipientSockets.size > 0) {
          console.log(
            `Sending rental update to user ${recipient} on sockets:`,
            recipientSockets
          );

          recipientSockets.forEach((socketId) => {
            io.to(socketId).emit("receiveRentalUpdate", {
              rentalId,
              sender,
              status,
              timestamp: new Date(),
            });
          });

          console.log(`Rental update successfully sent to user ${recipient}`);
        } else {
          console.log(`User ${recipient} is offline. Notification stored.`);
        }
      } catch (error) {
        console.error("Error processing rental update:", error);
      }
    });

    // Handle transaction update status for both owner and renter
    socket.on("update-status", (data) => {
      const { rentalId, owner, renter, status } = data;

      try {
        const users = [owner, renter]; // Notify both owner & renter

        users.forEach((user) => {
          if (!user) return;

          const sockets = userSockets.get(user.toString()); // Get user's active sockets

          if (sockets && sockets.size > 0) {
            console.log(
              `Sending rental update to user ${user} on sockets:`,
              sockets
            );

            sockets.forEach((socketId) => {
              io.to(socketId).emit("receiveUpdate", {
                rentalId,
                status,
                timestamp: new Date(),
              });
            });

            console.log(`Rental update successfully sent to user ${user}`);
          } else {
            console.log(`User ${user} is offline. Notification stored.`);
          }
        });
      } catch (error) {
        console.error("Error processing rental update:", error);
      }
    });

    // Clean up on disconnect
    socket.on("disconnect", () => {
      adminSockets.delete(socket.id);

      // Properly handle user socket disconnections
      for (const [userId, socketSet] of userSockets.entries()) {
        if (socketSet.has(socket.id)) {
          socketSet.delete(socket.id);
          console.log(`Socket ${socket.id} removed for user ${userId}`);

          // If no more sockets for this user, remove the user entry
          if (socketSet.size === 0) {
            userSockets.delete(userId);
            console.log(`User ${userId} completely disconnected`);
          }
        }
      }

      console.log(
      //   "Client disconnected. Remaining admin sockets:",
      //   Array.from(adminSockets)
      // );
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
      console.error("Error emitting user notification:", error);
    }
  };

  return { io, notifyAdmins, emitNotification };
}

module.exports = { initializeSocket };
