const express = require('express');

const router = express.Router();

const {
  createBooking,
  getBookings,
  getMyBookings,
  getBookingById,
  getMyAssignedBookings,
  getAvailableWorkers,
  assignWorkerToBooking,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
  submitFeedback,
  markPaymentAsPaid
} = require('../controllers/bookingController');

const {
  protect,
  authorize
} = require('../middleware/authMiddleware');


// ============================================================
// CREATE BOOKING
// POST /api/bookings
// ============================================================

router.post(
  '/',
  protect,
  authorize('customer'),
  createBooking
);


// ============================================================
// GET ALL BOOKINGS - ADMIN
// GET /api/bookings
// ============================================================

router.get(
  '/',
  protect,
  authorize('admin'),
  getBookings
);


// ============================================================
// GET CUSTOMER BOOKINGS
// GET /api/bookings/my-bookings
// ============================================================

router.get(
  '/my-bookings',
  protect,
  authorize('customer'),
  getMyBookings
);


// ============================================================
// GET WORKER'S ASSIGNED BOOKINGS
// GET /api/bookings/assigned
// ============================================================

router.get(
  '/assigned',
  protect,
  authorize('worker'),
  getMyAssignedBookings
);


// ============================================================
// GET AVAILABLE WORKERS - ADMIN
// GET /api/bookings/available-workers
// ============================================================

router.get(
  '/available-workers',
  protect,
  authorize('admin'),
  getAvailableWorkers
);


// ============================================================
// GET SINGLE BOOKING DETAILS
// GET /api/bookings/:id
// ============================================================

router.get(
  '/:id',
  protect,
  authorize('customer', 'worker', 'admin'),
  getBookingById
);


// ============================================================
// ADMIN MANUALLY ASSIGN WORKER
// PATCH /api/bookings/:id/assign-worker
// ============================================================

router.patch(
  '/:id/assign-worker',
  protect,
  authorize('admin'),
  assignWorkerToBooking
);


// ============================================================
// CUSTOMER CANCEL BOOKING
// PATCH /api/bookings/:id/cancel
// ============================================================

router.patch(
  '/:id/cancel',
  protect,
  authorize('customer'),
  cancelBooking
);


// ============================================================
// CUSTOMER RESCHEDULE BOOKING
// PATCH /api/bookings/:id/reschedule
// ============================================================

router.patch(
  '/:id/reschedule',
  protect,
  authorize('customer'),
  rescheduleBooking
);


// ============================================================
// CUSTOMER PAYMENT
// PATCH /api/bookings/:id/payment
// ============================================================

router.patch(
  '/:id/payment',
  protect,
  authorize('customer'),
  markPaymentAsPaid
);


// ============================================================
// WORKER / ADMIN UPDATE BOOKING STATUS
// PATCH /api/bookings/:id/status
// ============================================================

router.patch(
  '/:id/status',
  protect,
  authorize('worker', 'admin'),
  updateBookingStatus
);


// ============================================================
// CUSTOMER SUBMITS FEEDBACK
// POST /api/bookings/:id/feedback
// ============================================================

router.post(
  '/:id/feedback',
  protect,
  authorize('customer'),
  submitFeedback
);


module.exports = router;