const Notification = require('../models/NotificationModel');
const MessageNotification = require('../models/MessageNotificationModel');

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
      const notifications = await MessageNotification.findAll({
        where: { 
          recipient_id: userId,
          is_read: false 
        },
        order: [['createdAt', 'DESC']]
      });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  markMessageAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      await MessageNotification.update(
        { is_read: true },
        { where: { id } }
      );
      res.json({ message: 'Message notification marked as read' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

   markAllMessagesAsRead: async (req, res) => {
  try {
    const { userId } = req.params;  // Get the userId from the route parameters

    // Ensure you target only the unread message notifications for this user
    const updatedRows = await MessageNotification.update(
      { is_read: true },
      { where: { is_read: false, recipient_id: userId } }  // Filter by userId
    );

    if (updatedRows[0] === 0) {
      return res.status(404).json({ message: 'No unread message notifications found for this user' });
    }

    res.json({ message: 'All message notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},

  // Keep existing methods
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