const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/NotificationController");

// Middleware to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Admin/General notification routes
router.post("/", asyncHandler(notificationController.createNotification));
router.get("/", asyncHandler(notificationController.getNotifications));
router.put("/:id/read", asyncHandler(notificationController.markAsRead));
router.put(
  "/mark-all-read",
  asyncHandler(notificationController.markAllAsRead)
);
router.patch(
  "/student/:id/read",
  asyncHandler(notificationController.markStudentNotificationAsRead)
);

// Message notification routes
router.post(
  "/message",
  asyncHandler(notificationController.createMessageNotification)
);
router.get(
  "/message/:userId",
  asyncHandler(notificationController.getMessageNotifications)
);
router.put(
  "/message/:id/read",
  asyncHandler(notificationController.markMessageAsRead)
);

// Get unread notifications count for a user
router.get(
  "/unread/:userId",
  asyncHandler(notificationController.getMessageNotifications)
);

// Route to mark all messages as read for a specific user
router.put(
  "/message/mark-all-read/:userId",
  asyncHandler(async (req, res) => {
    try {
      // console.log("Received params:", req.params); // Log the params to verify
      const { userId } = req.params;
      // console.log(`Marking all messages as read for user: ${userId}`);
      await notificationController.markAllMessagesAsRead(req.params.userId);
      res.json({ message: "All messages marked as read" });
    } catch (error) {
      console.error("Error in markAllMessagesAsRead:", error);
      res.status(500).json({ error: error.message });
    }
  })
);
// ----- Student Notification Routes -----
router.post(
  "/student",
  asyncHandler(notificationController.createStudentNotification)
);
router.get(
  "/student/:userId",
  asyncHandler(notificationController.getStudentNotifications)
);
router.put(
  "/student/:id/read",
  asyncHandler(notificationController.markStudentNotificationAsRead)
);
router.put(
  "/student/mark-all-read/:userId",
  asyncHandler(notificationController.markAllStudentNotificationsAsRead)
);
router.put(
  "/message/conversation/:conversationId/user/:userId/read",
  asyncHandler(notificationController.markConversationAsRead)
);
// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "An error occurred processing your request",
    message: err.message,
  });
});

module.exports = router;
