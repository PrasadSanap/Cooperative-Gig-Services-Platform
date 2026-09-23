const express = require('express');

const router = express.Router();

const {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} = require('../controllers/notificationController');

const {
  protect
} = require('../middleware/authMiddleware');

// Get all notifications for logged-in user
router.get('/', protect, getNotifications);

// Get unread notification count
router.get('/unread-count', protect, getUnreadNotificationCount);

// Mark all notifications as read
router.patch('/read-all', protect, markAllNotificationsAsRead);

// Mark one notification as read
router.patch('/:id/read', protect, markNotificationAsRead);

// Delete one notification
router.delete('/:id', protect, deleteNotification);

module.exports = router;