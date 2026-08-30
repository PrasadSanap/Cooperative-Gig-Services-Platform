// Routes for the sample booking feature
const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  updateBookingStatus,
  submitFeedback,
} = require('../controllers/bookingController');

// POST /api/bookings — create a booking (customer books a service)
router.post('/', createBooking);

// GET /api/bookings — list bookings (filter by ?customerId= or ?workerId=)
router.get('/', getBookings);

// PATCH /api/bookings/:id/status — update booking status
router.patch('/:id/status', updateBookingStatus);

// POST /api/bookings/:id/feedback — submit rating/feedback
router.post('/:id/feedback', submitFeedback);

module.exports = router;