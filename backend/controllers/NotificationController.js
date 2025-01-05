const Notification = require('../models/NotificationModel');
const MessageNotification = require('../models/MessageNotificationModel');
const User = require('../models/UserModel'); 

const notificationController = {
  // Existing admin notification methods
  createNotification: async (req, res) => {
    try {
      const notification = await Notification.create(req.body);
      req.notifyAdmins(notification);
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // New message notification methods
  createMessageNotification: async (req, res) => {
    try {
      const notification = await MessageNotification.create({
        recipient_id: req.body.recipient_id,
        sender_id: req.body.sender_id,
        message: req.body.message,
        conversation_id: req.body.conversation_id,
        is_read: false
      });
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

    getMessageNotifications: async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching notifications for userId:", userId);

    const notifications = await MessageNotification.findAll({
      where: { recipient_id: userId, is_read: false },
      include: [{ model: User, as: "sender", attributes: ["first_name", "last_name"]}],
      order: [["createdAt", "DESC"]],
    });

    // Ensure each notification includes the conversation_id
    const notificationsWithConversationId = notifications.map(notification => ({
      ...notification.toJSON(),  // Convert sequelize object to plain JSON
      conversation_id: notification.conversation_id,  // Ensure conversation_id is in response
    }));

    // Send the final response with the updated notifications
    res.json(notificationsWithConversationId);  // Only send this once

  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: error.message });
  }
},


    markMessageAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Marking message as read. Notification ID:', id);

      const updatedRows = await MessageNotification.update(
        { is_read: true },
        { where: { id } }
      );
      
      if (updatedRows[0] === 0) {
        console.log('No rows updated for this notification ID');
        return res.status(404).json({ message: 'Message notification not found or already marked as read' });
      }

      console.log('Message notification marked as read successfully');
      res.json({ message: 'Message notification marked as read' });
    } catch (error) {
      console.error('Error in markMessageAsRead:', error);
      res.status(500).json({ error: error.message });
    }
  },

    markAllMessagesAsRead: async (userId) => {
    try {
      console.log(`Marking all messages as read for user: ${userId}`);
      
      const updatedRows = await MessageNotification.update(
        { is_read: true },
        { where: { is_read: false, recipient_id: userId } }
      );

      if (updatedRows[0] === 0) {
        return { status: 404, message: 'No unread message notifications found for this user' };
      }

      return { status: 200, message: 'All message notifications marked as read' };
    } catch (error) {
      console.error('Error in markAllMessagesAsRead:', error);
      throw error;
    }
  },


  // Admin side notification
  getNotifications: async (req, res) => {
    try {
      const notifications = await Notification.findAll({
        order: [['timestamp', 'DESC']],
        limit: 50
      });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      notification.isRead = true;
      await notification.save();
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      await Notification.update(
        { isRead: true },
        { where: { isRead: false } }
      );
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = notificationController;