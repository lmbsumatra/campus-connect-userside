const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');

router.post('/', notificationController.createNotification);
router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead);

module.exports = router;