const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    type: {
      type: String,
      enum: [
        'booking_created',
        'booking_confirmed',
        'worker_assigned',
        'booking_started',
        'booking_completed',
        'booking_cancelled',
        'booking_rescheduled',
        'payment_completed',
        'feedback_received',
        'worker_verified',
        'general'
      ],
      default: 'general'
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Faster retrieval of a user's notifications
notificationSchema.index({
  recipient: 1,
  createdAt: -1
});

// Faster retrieval of unread notifications
notificationSchema.index({
  recipient: 1,
  isRead: 1
});

module.exports = mongoose.model(
  'Notification',
  notificationSchema
);