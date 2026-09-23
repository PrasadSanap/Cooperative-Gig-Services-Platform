const express = require('express');

const {
  getAdminStats,
  getAllWorkers,
  verifyWorker,
  unverifyWorker,
  updateWorkerAvailability,
  getAllBookings,
  assignWorker,
  updateAdminBookingStatus
} = require('../controllers/adminController');

const {
  protect,
  authorize
} = require('../middleware/authMiddleware');

const router = express.Router();

// ----------------------------------------------------
// Admin Statistics
// ----------------------------------------------------

router.get(
  '/stats',
  protect,
  authorize('admin'),
  getAdminStats
);

// ----------------------------------------------------
// Worker Management
// ----------------------------------------------------

router.get(
  '/workers',
  protect,
  authorize('admin'),
  getAllWorkers
);

router.put(
  '/workers/:workerId/verify',
  protect,
  authorize('admin'),
  verifyWorker
);

router.put(
  '/workers/:workerId/unverify',
  protect,
  authorize('admin'),
  unverifyWorker
);

// Update worker availability
router.put(
  '/workers/:workerId/availability',
  protect,
  authorize('admin'),
  updateWorkerAvailability
);

// ----------------------------------------------------
// Booking Management
// ----------------------------------------------------

router.get(
  '/bookings',
  protect,
  authorize('admin'),
  getAllBookings
);

router.patch(
  '/bookings/:bookingId/assign',
  protect,
  authorize('admin'),
  assignWorker
);

router.patch(
  '/bookings/:bookingId/status',
  protect,
  authorize('admin'),
  updateAdminBookingStatus
);

module.exports = router;