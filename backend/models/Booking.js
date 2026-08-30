// Booking/scheduling model — the core sample feature
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }, // assigned after matching
    serviceType: {
      type: String,
      enum: [
        'electrician', 'plumber', 'carpenter', 'painter', 'helper',
        'caregiver', 'driver', 'gardener', 'cleaner', 'technician',
      ],
      required: true,
    },
    isEmergency: { type: Boolean, default: false }, // on-demand/emergency flag
    scheduledAt: { type: Date, required: true },
    location: {
      // where the service is needed
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
      address: String,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    payment: {
      amount: Number,
      status: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
      transactionId: String,
      invoiceNumber: String,
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ location: '2dsphere' }); // to find nearby workers for this booking

module.exports = mongoose.model('Booking', bookingSchema);