// Worker skill profile: certification, verification, welfare/insurance status
const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skills: [
      {
        type: String,
        enum: [
          'electrician', 'plumber', 'carpenter', 'painter', 'helper',
          'caregiver', 'driver', 'gardener', 'cleaner', 'technician',
        ],
      },
    ],
    certifications: [
      {
        title: String,
        issuedBy: String,
        issuedDate: Date,
        verified: { type: Boolean, default: false }, // federation admin verifies
      },
    ],
    cooperativeId: { type: String, required: true }, // links worker to their federation/society
    isVerified: { type: Boolean, default: false }, // overall verification status
    availability: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available',
    },
    welfare: {
      insuranceEnrolled: { type: Boolean, default: false },
      insuranceProvider: String,
      policyNumber: String,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat] for live geo-matching
    },
  },
  { timestamps: true }
);

workerSchema.index({ currentLocation: '2dsphere' }); // geo-matching index

module.exports = mongoose.model('Worker', workerSchema);