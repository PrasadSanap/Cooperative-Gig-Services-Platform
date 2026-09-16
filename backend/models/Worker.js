const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    skills: {
      type: [
        {
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
          ]
        }
      ],
      default: []
    },

    certifications: [
      {
        title: String,
        issuedBy: String,
        issuedDate: Date,
        verified: {
          type: Boolean,
          default: false
        }
      }
    ],

    cooperativeId: {
      type: String,
      required: true
    },

    experienceYears: {
      type: Number,
      default: 0,
      min: 0
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    availability: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'offline'
    },

    welfare: {
      insuranceEnrolled: {
        type: Boolean,
        default: false
      },
      insuranceProvider: String,
      policyNumber: String
    },

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0,
        min: 0
      }
    },

    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  {
    timestamps: true
  }
);

workerSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Worker', workerSchema);