const User = require('../models/User');
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');

const { createNotification } = require('../utils/notificationHelper');

// ============================================================
// ADMIN STATISTICS
// ============================================================

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalCustomers = await User.countDocuments({
      role: 'customer'
    });

    const totalWorkers = await User.countDocuments({
      role: 'worker'
    });

    const totalBookings = await Booking.countDocuments();

    const confirmedBookings = await Booking.countDocuments({
      status: 'confirmed'
    });

    const inProgressBookings = await Booking.countDocuments({
      status: 'in_progress'
    });

    const completedBookings = await Booking.countDocuments({
      status: 'completed'
    });

    const cancelledBookings = await Booking.countDocuments({
      status: 'cancelled'
    });

    const paidBookings = await Booking.countDocuments({
      'payment.status': 'paid'
    });

    const unpaidBookings = await Booking.countDocuments({
      'payment.status': 'unpaid'
    });

    const revenueResult = await Booking.aggregate([
      {
        $match: {
          'payment.status': 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: '$payment.amount'
          }
        }
      }
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    const workers = await Worker.find().select(
      'rating availability isVerified'
    );

    const availableWorkers = workers.filter(
      (worker) => worker.availability === 'available'
    ).length;

    const verifiedWorkers = workers.filter(
      (worker) => worker.isVerified === true
    ).length;

    res.status(200).json({
      totalUsers,
      totalCustomers,
      totalWorkers,
      totalBookings,
      confirmedBookings,
      inProgressBookings,
      completedBookings,
      cancelledBookings,
      paidBookings,
      unpaidBookings,
      totalRevenue,
      availableWorkers,
      verifiedWorkers
    });
  } catch (err) {
    console.error('Error fetching admin statistics:', err);

    res.status(500).json({
      message: 'Server error fetching admin statistics',
      error: err.message
    });
  }
};

// ============================================================
// GET ALL WORKERS
// ============================================================

const getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find()
      .populate('user', 'name email phone role')
      .sort({ createdAt: -1 });

    res.status(200).json(workers);
  } catch (err) {
    console.error('Error fetching workers:', err);

    res.status(500).json({
      message: 'Server error fetching workers'
    });
  }
};

// ============================================================
// VERIFY WORKER
// ============================================================

const verifyWorker = async (req, res) => {
  try {
    const { workerId } = req.params;

    const worker = await Worker.findById(workerId)
      .populate('user', 'name email phone');

    if (!worker) {
      return res.status(404).json({
        message: 'Worker not found'
      });
    }

    worker.isVerified = true;

    await worker.save();

    // Notify worker after verification
    if (worker.user?._id) {
      await createNotification({
        recipient: worker.user._id,
        type: 'worker_verified',
        title: 'Worker Account Verified',
        message:
          'Your worker account has been verified by the admin.'
      });
    }

    res.status(200).json({
      message: 'Worker verified successfully',
      worker
    });
  } catch (err) {
    console.error('Error verifying worker:', err);

    res.status(500).json({
      message: 'Server error verifying worker'
    });
  }
};

// ============================================================
// UNVERIFY WORKER
// ============================================================

const unverifyWorker = async (req, res) => {
  try {
    const { workerId } = req.params;

    const worker = await Worker.findById(workerId)
      .populate('user', 'name email phone');

    if (!worker) {
      return res.status(404).json({
        message: 'Worker not found'
      });
    }

    worker.isVerified = false;

    await worker.save();

    // Notify worker after verification is removed
    if (worker.user?._id) {
      await createNotification({
        recipient: worker.user._id,
        type: 'general',
        title: 'Worker Verification Removed',
        message:
          'Your worker verification has been removed by the admin.'
      });
    }

    res.status(200).json({
      message: 'Worker unverified successfully',
      worker
    });
  } catch (err) {
    console.error('Error unverifying worker:', err);

    res.status(500).json({
      message: 'Server error unverifying worker'
    });
  }
};

// ============================================================
// UPDATE WORKER AVAILABILITY
// ============================================================

const updateWorkerAvailability = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { availability } = req.body;

    const allowedAvailability = [
      'available',
      'busy',
      'offline'
    ];

    if (!allowedAvailability.includes(availability)) {
      return res.status(400).json({
        message:
          'Invalid availability. Use available, busy, or offline.'
      });
    }

    const worker = await Worker.findById(workerId)
      .populate('user', 'name email phone');

    if (!worker) {
      return res.status(404).json({
        message: 'Worker not found'
      });
    }

    worker.availability = availability;

    await worker.save();

    // Notify worker about availability change
    if (worker.user?._id) {
      await createNotification({
        recipient: worker.user._id,
        type: 'general',
        title: 'Availability Updated',
        message: `Your availability has been changed to ${availability} by the admin.`
      });
    }

    res.status(200).json({
      message: 'Worker availability updated successfully',
      worker
    });
  } catch (err) {
    console.error(
      'Error updating worker availability:',
      err
    );

    res.status(500).json({
      message:
        'Server error updating worker availability',
      error: err.message
    });
  }
};

// ============================================================
// GET ALL BOOKINGS
// ============================================================

const getAllBookings = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const bookings = await Booking.find(filter)
      .populate('customer', 'name email phone')
      .populate({
        path: 'worker',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    console.error(
      'Error fetching admin bookings:',
      err
    );

    res.status(500).json({
      message: 'Server error fetching bookings'
    });
  }
};

// ============================================================
// ASSIGN WORKER TO BOOKING
// ============================================================

const assignWorker = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({
        message: 'Worker ID is required'
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    const worker = await Worker.findById(workerId)
      .populate('user', 'name email phone');

    if (!worker) {
      return res.status(404).json({
        message: 'Worker not found'
      });
    }

    // --------------------------------------------------------
    // SAFETY CHECK 1: Worker must be verified
    // --------------------------------------------------------

    if (worker.isVerified !== true) {
      return res.status(400).json({
        message:
          'Cannot assign an unverified worker'
      });
    }

    // --------------------------------------------------------
    // SAFETY CHECK 2: Worker must be available
    // --------------------------------------------------------

    if (worker.availability !== 'available') {
      return res.status(400).json({
        message:
          'Cannot assign a worker who is not available'
      });
    }

    // --------------------------------------------------------
    // SAFETY CHECK 3: Worker must have required skill
    // --------------------------------------------------------

    if (
      Array.isArray(worker.skills) &&
      worker.skills.length > 0 &&
      !worker.skills.includes(booking.serviceType)
    ) {
      return res.status(400).json({
        message:
          `Worker does not have the required skill: ${booking.serviceType}`
      });
    }

    // --------------------------------------------------------
    // Assign worker
    // --------------------------------------------------------

    booking.worker = worker._id;

    if (booking.status === 'pending') {
      booking.status = 'confirmed';
    }

    await booking.save();

    // --------------------------------------------------------
    // Notify assigned worker
    // --------------------------------------------------------

    if (worker.user?._id) {
      await createNotification({
        recipient: worker.user._id,
        type: 'worker_assigned',
        title: 'New Booking Assigned',
        message:
          `You have been assigned a new ${booking.serviceType} service booking.`,
        booking: booking._id
      });
    }

    // --------------------------------------------------------
    // Notify customer
    // --------------------------------------------------------

    if (booking.customer) {
      await createNotification({
        recipient: booking.customer,
        type: 'booking_confirmed',
        title: 'Worker Assigned',
        message:
          'A worker has been assigned to your booking.',
        booking: booking._id
      });
    }

    const updatedBooking = await Booking.findById(
      booking._id
    )
      .populate('customer', 'name email phone')
      .populate({
        path: 'worker',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      });

    res.status(200).json({
      message: 'Worker assigned successfully',
      booking: updatedBooking
    });
  } catch (err) {
    console.error(
      'Error assigning worker:',
      err
    );

    res.status(500).json({
      message: 'Server error assigning worker',
      error: err.message
    });
  }
};

// ============================================================
// UPDATE ADMIN BOOKING STATUS
// ============================================================

const updateAdminBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      'pending',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid booking status'
      });
    }

    const booking = await Booking.findById(
      req.params.bookingId
    );

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    booking.status = status;

    await booking.save();

    res.status(200).json({
      message:
        'Booking status updated successfully',
      booking
    });
  } catch (err) {
    console.error(
      'Error updating admin booking status:',
      err
    );

    res.status(500).json({
      message:
        'Server error updating booking status'
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getAdminStats,
  getAllWorkers,
  verifyWorker,
  unverifyWorker,
  updateWorkerAvailability,
  getAllBookings,
  assignWorker,
  updateAdminBookingStatus
};