// Base user model — shared by customers and cooperative admins
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'worker', 'admin'],
      default: 'customer',
    },
    preferredLanguage: { type: String, default: 'en' }, // for multilingual UX
    location: {
      // GeoJSON point for geo-matching (customer's default address)
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' }); // enables geo queries

module.exports = mongoose.model('User', userSchema);