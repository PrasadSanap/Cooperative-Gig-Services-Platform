const Notification = require('../models/Notification');

// Get notifications for logged-in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id
    })
      .populate('booking', 'serviceType scheduledAt status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Get unread notification count
const getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread notification count error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread notification count'
    });
  }
};

// Mark one notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user.id,
        isRead: false
      },
      {
        $set: {
          isRead: true
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

// Delete one notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
};