const Notification = require('../models/NotificationModel');

const notificationController = {
  // Create notification
  createNotification: async (req, res) => {
    try {
      const notification = await Notification.create(req.body);
      // Emit socket event after creating notification
      req.notifyAdmins(notification);
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all notifications
  getNotifications: async (req, res) => {
    try {
      const notifications = await Notification.findAll({
        order: [['timestamp', 'DESC']],
        limit: 50 // Limit to recent 50 notifications
      });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Mark notification as read
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

  // Mark all notifications as read
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