const express = require('express');

const {
  getAdminStats,
  getAllWorkers,
  verifyWorker,
  getAllBookings,
  assignWorker,
  updateAdminBookingStatus
} = require('../controllers/adminController');

const {
  protect,
  authorize
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
  '/stats',
  protect,
  authorize('admin'),
  getAdminStats
);

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