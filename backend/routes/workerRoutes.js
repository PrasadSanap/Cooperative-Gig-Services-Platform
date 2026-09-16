const express = require('express');

const router = express.Router();

const {
  getMyWorkerProfile,
  updateMyWorkerProfile,
  updateAvailability,
  updateCurrentLocation
} = require('../controllers/workerController');

const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyWorkerProfile);

router.patch('/me', protect, updateMyWorkerProfile);

router.patch('/availability', protect, updateAvailability);

router.patch('/location', protect, updateCurrentLocation);

module.exports = router;