// Booking/scheduling model — core booking feature
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------
    // CUSTOMER
    // ----------------------------------------------------
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // ----------------------------------------------------
    // WORKER
    // ----------------------------------------------------
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker'
    },

    // ----------------------------------------------------
    // SERVICE
    // ----------------------------------------------------
    serviceType: {
      type: String,
      enum: [
        'electrician',
        'plumber',
        'carpenter',
        'painter',
        'helper',
        'caregiver',
        'driver',
        'gardener',
        'cleaner',
        'technician'
      ],
      required: true
    },

    isEmergency: {
      type: Boolean,
      default: false
    },

    // ----------------------------------------------------
    // SCHEDULE
    // ----------------------------------------------------
    scheduledAt: {
      type: Date,
      required: true
    },

    // ----------------------------------------------------
    // LOCATION
    // ----------------------------------------------------
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },

      coordinates: {
        type: [Number],
        required: true
      },

      address: String
    },

    // ----------------------------------------------------
    // BOOKING STATUS
    // ----------------------------------------------------
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled'
      ],
      default: 'pending'
    },

    // ----------------------------------------------------
    // CANCELLATION INFORMATION
    // ----------------------------------------------------
    cancellation: {
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },

      reason: {
        type: String,
        trim: true,
        maxlength: 500
      },

      cancelledAt: {
        type: Date
      }
    },

    // ----------------------------------------------------
    // RESCHEDULE HISTORY
    // ----------------------------------------------------
    rescheduleHistory: [
      {
        previousScheduledAt: {
          type: Date,
          required: true
        },

        newScheduledAt: {
          type: Date,
          required: true
        },

        reason: {
          type: String,
          trim: true,
          maxlength: 500
        },

        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },

        changedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // ----------------------------------------------------
    // PAYMENT
    // ----------------------------------------------------
    payment: {
      amount: Number,

      status: {
        type: String,
        enum: [
          'unpaid',
          'paid',
          'refunded'
        ],
        default: 'unpaid'
      },

      transactionId: String,

      invoiceNumber: String
    },

    // ----------------------------------------------------
    // CUSTOMER FEEDBACK
    // ----------------------------------------------------
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },

      comment: String
    }
  },
  {
    timestamps: true
  }
);

// ----------------------------------------------------
// GEO LOCATION INDEX
// ----------------------------------------------------
bookingSchema.index({
  location: '2dsphere'
});

// ----------------------------------------------------
// EXPORT MODEL
// ----------------------------------------------------
module.exports = mongoose.model(
  'Booking',
  bookingSchema
);