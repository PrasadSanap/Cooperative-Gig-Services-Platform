// Controller logic for the sample "booking" feature
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const { createPaymentOrder, generateInvoiceNumber } = require('../utils/payment');

// @desc   Create a new booking + geo-match nearest available worker
// @route  POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { customerId, serviceType, isEmergency, scheduledAt, coordinates, address, amount } = req.body;

    if (!customerId || !serviceType || !coordinates) {
      return res.status(400).json({ message: 'customerId, serviceType, and coordinates are required' });
    }

    // Geo-match: find nearest available worker with the requested skill
    const nearestWorker = await Worker.findOne({
      skills: serviceType,
      availability: 'available',
      isVerified: true,
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: 15000, // 15 km radius
        },
      },
    });

    // Create payment order (stubbed if gateway not configured)
    const paymentOrder = await createPaymentOrder(amount || 500);

    const booking = await Booking.create({
      customer: customerId,
      worker: nearestWorker ? nearestWorker._id : undefined,
      serviceType,
      isEmergency: !!isEmergency,
      scheduledAt: scheduledAt || new Date(),
      location: { type: 'Point', coordinates, address },
      status: nearestWorker ? 'confirmed' : 'pending',
      payment: {
        amount: amount || 500,
        status: 'unpaid',
        transactionId: paymentOrder.id,
        invoiceNumber: generateInvoiceNumber(),
      },
    });

    res.status(201).json({
      message: nearestWorker ? 'Booking confirmed with matched worker' : 'Booking created, awaiting worker match',
      booking,
      matchedWorker: nearestWorker ? { id: nearestWorker._id, skills: nearestWorker.skills } : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating booking', error: err.message });
  }
};

// @desc   Get all bookings (optionally filter by customer or worker)
// @route  GET /api/bookings
const getBookings = async (req, res) => {
  try {
    const filter = {};

    if (req.query.customerId) {
      filter.customer = req.query.customerId;
    }

    if (req.query.workerId) {
      filter.worker = req.query.workerId;
    }

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);

    res.status(500).json({
      message: 'Server error fetching bookings',
      error: err.message
    });
  }
};

// @desc   Update booking status (confirm, complete, cancel)
// @route  PATCH /api/bookings/:id/status
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating booking', error: err.message });
  }
};

// @desc   Submit rating/feedback for a completed booking
// @route  POST /api/bookings/:id/feedback
const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { feedback: { rating, comment } },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Update worker's aggregate rating
    if (booking.worker) {
      const worker = await Worker.findById(booking.worker);
      if (worker) {
        const newCount = worker.rating.count + 1;
        const newAvg = (worker.rating.average * worker.rating.count + rating) / newCount;
        worker.rating = { average: newAvg, count: newCount };
        await worker.save();
      }
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error submitting feedback', error: err.message });
  }
};

module.exports = { createBooking, getBookings, updateBookingStatus, submitFeedback };