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
    console.log('Creating message notification with body:', req.body);
    const notification = await MessageNotification.create({
      recipient_id: req.body.recipient_id,
      sender_id: req.body.sender_id,
      message: req.body.message,
      conversation_id: req.body.conversation_id,
      is_read: false
    });
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating message notification:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
markAllMessagesAsRead: async (userId) => {
    try {
      console.log(`Marking all messages as read for user: ${userId}`);
      
      const updatedRows = await MessageNotification.update(
        { is_read: true },
        { 
          where: { 
            recipient_id: userId,
            is_read: false 
          } 
        }
      );

      // Send a proper response object
      return {
        status: updatedRows[0] > 0 ? 200 : 404,
        message: updatedRows[0] > 0 
          ? 'All messages marked as read'
          : 'No unread messages found'
      };
    } catch (error) {
      console.error('Error in markAllMessagesAsRead:', error);
      throw error;
    }
  },
    markMessageAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedRows = await MessageNotification.update(
        { is_read: true },
        { 
          where: { id: id }
        }
      );

      if (updatedRows[0] === 0) {
        return res.status(404).json({
          message: 'Message notification not found'
        });
      }

      res.json({
        message: 'Message marked as read successfully'
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ error: error.message });
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