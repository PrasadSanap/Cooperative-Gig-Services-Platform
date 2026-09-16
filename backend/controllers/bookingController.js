const Booking = require('../models/Booking');
const Worker = require('../models/Worker');

const {
  createPaymentOrder,
  generateInvoiceNumber
} = require('../utils/payment');


// ============================================================
// CREATE BOOKING
// POST /api/bookings
// ============================================================

const createBooking = async (req, res) => {
  try {
    const {
      serviceType,
      isEmergency,
      scheduledAt,
      coordinates,
      address,
      amount
    } = req.body;

    const customerId = req.user.id;

    if (!serviceType) {
      return res.status(400).json({
        message: 'serviceType is required'
      });
    }

    if (
      !Array.isArray(coordinates) ||
      coordinates.length !== 2
    ) {
      return res.status(400).json({
        message: 'Valid coordinates are required'
      });
    }

    const longitude = Number(coordinates[0]);
    const latitude = Number(coordinates[1]);

    if (
      Number.isNaN(longitude) ||
      Number.isNaN(latitude) ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      return res.status(400).json({
        message: 'Invalid coordinates'
      });
    }

    const normalizedServiceType =
      serviceType.toLowerCase().trim();

    let matchingWorker = null;


    // ----------------------------------------------------
    // STEP 1: Try to find the nearest matching worker
    // ----------------------------------------------------

    try {
      matchingWorker = await Worker.findOne({
        skills: normalizedServiceType,
        availability: 'available',
        isVerified: true,
        'currentLocation.coordinates': {
          $exists: true,
          $ne: [0, 0]
        },
        currentLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [
                longitude,
                latitude
              ]
            },
            $maxDistance: 15000
          }
        }
      });
    } catch (locationError) {
      console.log(
        'Location-based worker matching skipped:',
        locationError.message
      );
    }


    // ----------------------------------------------------
    // STEP 2: If no nearby worker found,
    // find ANY available verified worker
    // with the required service skill.
    // ----------------------------------------------------

    if (!matchingWorker) {
      matchingWorker = await Worker.findOne({
        skills: normalizedServiceType,
        availability: 'available',
        isVerified: true
      }).sort({
        'rating.average': -1,
        'rating.count': -1,
        createdAt: 1
      });
    }


    // ----------------------------------------------------
    // STEP 3: Create payment order
    // ----------------------------------------------------

    const paymentOrder = await createPaymentOrder(
      amount || 500
    );


    // ----------------------------------------------------
    // STEP 4: Create booking
    // ----------------------------------------------------

    const booking = await Booking.create({
      customer: customerId,

      worker: matchingWorker
        ? matchingWorker._id
        : undefined,

      serviceType: normalizedServiceType,

      isEmergency: !!isEmergency,

      scheduledAt:
        scheduledAt || new Date(),

      location: {
        type: 'Point',
        coordinates: [
          longitude,
          latitude
        ],
        address
      },

      status: matchingWorker
        ? 'confirmed'
        : 'pending',

      payment: {
        amount: amount || 500,
        status: 'unpaid',
        transactionId: paymentOrder.id,
        invoiceNumber: generateInvoiceNumber()
      }
    });


    // ----------------------------------------------------
    // STEP 5: Response
    // ----------------------------------------------------

    res.status(201).json({
      message: matchingWorker
        ? 'Booking confirmed with matched worker'
        : 'Booking created, awaiting worker match',

      booking,

      matchedWorker: matchingWorker
        ? {
            id: matchingWorker._id,
            skills: matchingWorker.skills
          }
        : null
    });

  } catch (err) {
    console.error(
      'Error creating booking:',
      err
    );

    res.status(500).json({
      message: 'Server error creating booking',
      error: err.message
    });
  }
};


// ============================================================
// GET ALL BOOKINGS
// GET /api/bookings
// ============================================================

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
      .populate(
        'customer',
        'name email phone'
      )
      .populate({
        path: 'worker',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .sort({
        createdAt: -1
      });

    res.status(200).json(bookings);

  } catch (err) {
    console.error(
      'Error fetching bookings:',
      err
    );

    res.status(500).json({
      message: 'Server error fetching bookings',
      error: err.message
    });
  }
};


// ============================================================
// GET CUSTOMER BOOKINGS
// GET /api/bookings/my-bookings
// ============================================================

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customer: req.user.id
    })
      .populate({
        path: 'worker',
        populate: {
          path: 'user',
          select: 'name phone email'
        }
      })
      .sort({
        createdAt: -1
      });

    res.status(200).json(bookings);

  } catch (err) {
    console.error(
      'Error fetching customer bookings:',
      err
    );

    res.status(500).json({
      message:
        'Server error fetching your bookings',
      error: err.message
    });
  }
};


// ============================================================
// GET SINGLE BOOKING DETAILS
// GET /api/bookings/:id
// ============================================================

const getBookingById = async (req, res) => {
  try {
    const booking =
      await Booking.findById(req.params.id)
        .populate(
          'customer',
          'name email phone'
        )
        .populate({
          path: 'worker',
          populate: {
            path: 'user',
            select: 'name email phone'
          }
        });

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }


    // ----------------------------------------------------
    // Customer can only view their own booking
    // ----------------------------------------------------

    if (
      req.user.role === 'customer' &&
      booking.customer._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message:
          'You can only view your own bookings'
      });
    }


    // ----------------------------------------------------
    // Worker can only view bookings assigned to them
    // ----------------------------------------------------

    if (req.user.role === 'worker') {
      if (
        !booking.worker ||
        booking.worker._id.toString() !== req.user.id
      ) {
        const worker = await Worker.findOne({
          user: req.user.id
        });

        if (
          !worker ||
          !booking.worker ||
          booking.worker._id.toString() !==
            worker._id.toString()
        ) {
          return res.status(403).json({
            message:
              'You can only view your assigned bookings'
          });
        }
      }
    }

    res.status(200).json({
      booking
    });

  } catch (err) {
    console.error(
      'Error fetching booking details:',
      err
    );

    res.status(500).json({
      message:
        'Server error fetching booking details',
      error: err.message
    });
  }
};


// ============================================================
// GET BOOKINGS ASSIGNED TO WORKER
// GET /api/bookings/assigned
// ============================================================

const getMyAssignedBookings = async (
  req,
  res
) => {
  try {
    const worker = await Worker.findOne({
      user: req.user.id
    });

    if (!worker) {
      return res.status(404).json({
        message: 'Worker profile not found'
      });
    }

    const bookings = await Booking.find({
      worker: worker._id
    })
      .populate(
        'customer',
        'name email phone'
      )
      .sort({
        createdAt: -1
      });

    res.status(200).json(bookings);

  } catch (err) {
    console.error(
      'Error fetching assigned bookings:',
      err
    );

    res.status(500).json({
      message:
        'Server error fetching assigned bookings',
      error: err.message
    });
  }
};


// ============================================================
// GET AVAILABLE WORKERS
// GET /api/bookings/available-workers
// ============================================================

const getAvailableWorkers = async (
  req,
  res
) => {
  try {
    const workers = await Worker.find({
      availability: 'available',
      isVerified: true
    })
      .populate(
        'user',
        'name email phone'
      )
      .sort({
        createdAt: -1
      });

    res.status(200).json(workers);

  } catch (err) {
    console.error(
      'Error fetching available workers:',
      err
    );

    res.status(500).json({
      message:
        'Server error fetching available workers',
      error: err.message
    });
  }
};


// ============================================================
// ADMIN MANUALLY ASSIGN WORKER
// PATCH /api/bookings/:id/assign-worker
// ============================================================

const assignWorkerToBooking = async (
  req,
  res
) => {
  try {
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({
        message: 'workerId is required'
      });
    }

    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    const worker = await Worker.findById(
      workerId
    );

    if (!worker) {
      return res.status(404).json({
        message: 'Worker not found'
      });
    }

    if (!worker.isVerified) {
      return res.status(400).json({
        message:
          'This worker is not verified'
      });
    }

    if (
      worker.availability !== 'available'
    ) {
      return res.status(400).json({
        message:
          'This worker is currently not available'
      });
    }

    if (
      worker.skills &&
      worker.skills.length > 0 &&
      !worker.skills.includes(
        booking.serviceType
      )
    ) {
      return res.status(400).json({
        message:
          `Selected worker does not provide ${booking.serviceType} service`
      });
    }

    booking.worker = worker._id;
    booking.status = 'confirmed';

    await booking.save();

    const updatedBooking =
      await Booking.findById(
        booking._id
      )
        .populate(
          'customer',
          'name email phone'
        )
        .populate({
          path: 'worker',
          populate: {
            path: 'user',
            select: 'name email phone'
          }
        });

    res.status(200).json({
      message:
        'Worker assigned successfully',
      booking: updatedBooking
    });

  } catch (err) {
    console.error(
      'Error assigning worker:',
      err
    );

    res.status(500).json({
      message:
        'Server error assigning worker',
      error: err.message
    });
  }
};


// ============================================================
// UPDATE BOOKING STATUS
// PATCH /api/bookings/:id/status
// ============================================================

const updateBookingStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      'confirmed',
      'in_progress',
      'completed',
      'cancelled'
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message:
          'Invalid booking status'
      });
    }

    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    if (req.user.role === 'worker') {
      const worker =
        await Worker.findOne({
          user: req.user.id
        });

      if (!worker || !booking.worker) {
        return res.status(403).json({
          message:
            'You can only update your assigned bookings'
        });
      }

      if (
        booking.worker.toString() !==
        worker._id.toString()
      ) {
        return res.status(403).json({
          message:
            'You can only update your assigned bookings'
        });
      }
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
      'Error updating booking status:',
      err
    );

    res.status(500).json({
      message:
        'Server error updating booking status',
      error: err.message
    });
  }
};


// ============================================================
// CANCEL BOOKING
// PATCH /api/bookings/:id/cancel
// Customer only
// ============================================================

const cancelBooking = async (
  req,
  res
) => {
  try {
    const {
      reason
    } = req.body;

    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }


    // ----------------------------------------------------
    // Ownership check
    // ----------------------------------------------------

    if (
      booking.customer.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          'You can only cancel your own bookings'
      });
    }


    // ----------------------------------------------------
    // Already cancelled
    // ----------------------------------------------------

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        message:
          'This booking is already cancelled'
      });
    }


    // ----------------------------------------------------
    // Completed / in-progress bookings
    // cannot be cancelled by customer
    // ----------------------------------------------------

    if (
      booking.status === 'in_progress'
    ) {
      return res.status(400).json({
        message:
          'A service that is already in progress cannot be cancelled'
      });
    }

    if (
      booking.status === 'completed'
    ) {
      return res.status(400).json({
        message:
          'A completed booking cannot be cancelled'
      });
    }


    // ----------------------------------------------------
    // Cancellation reason
    // ----------------------------------------------------

    const cancellationReason =
      typeof reason === 'string'
        ? reason.trim()
        : '';

    if (cancellationReason.length > 500) {
      return res.status(400).json({
        message:
          'Cancellation reason cannot exceed 500 characters'
      });
    }


    // ----------------------------------------------------
    // Update cancellation information
    // ----------------------------------------------------

    booking.status = 'cancelled';

    booking.cancellation = {
      cancelledBy: req.user.id,
      reason: cancellationReason,
      cancelledAt: new Date()
    };

    await booking.save();


    // ----------------------------------------------------
    // Response
    // ----------------------------------------------------

    res.status(200).json({
      message:
        'Booking cancelled successfully',
      booking
    });

  } catch (err) {
    console.error(
      'Error cancelling booking:',
      err
    );

    res.status(500).json({
      message:
        'Server error cancelling booking',
      error: err.message
    });
  }
};


// ============================================================
// RESCHEDULE BOOKING
// PATCH /api/bookings/:id/reschedule
// Customer only
// ============================================================

const rescheduleBooking = async (
  req,
  res
) => {
  try {
    const {
      scheduledAt,
      reason
    } = req.body;


    // ----------------------------------------------------
    // Validate new scheduled time
    // ----------------------------------------------------

    if (!scheduledAt) {
      return res.status(400).json({
        message:
          'New scheduled date and time are required'
      });
    }

    const newScheduledAt =
      new Date(scheduledAt);

    if (
      Number.isNaN(
        newScheduledAt.getTime()
      )
    ) {
      return res.status(400).json({
        message:
          'Invalid scheduled date and time'
      });
    }


    // ----------------------------------------------------
    // New date must be in the future
    // ----------------------------------------------------

    if (
      newScheduledAt.getTime() <=
      Date.now()
    ) {
      return res.status(400).json({
        message:
          'New scheduled date and time must be in the future'
      });
    }


    // ----------------------------------------------------
    // Find booking
    // ----------------------------------------------------

    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }


    // ----------------------------------------------------
    // Ownership check
    // ----------------------------------------------------

    if (
      booking.customer.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          'You can only reschedule your own bookings'
      });
    }


    // ----------------------------------------------------
    // Cannot reschedule cancelled booking
    // ----------------------------------------------------

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        message:
          'A cancelled booking cannot be rescheduled'
      });
    }


    // ----------------------------------------------------
    // Cannot reschedule in-progress booking
    // ----------------------------------------------------

    if (
      booking.status === 'in_progress'
    ) {
      return res.status(400).json({
        message:
          'A service that is already in progress cannot be rescheduled'
      });
    }


    // ----------------------------------------------------
    // Cannot reschedule completed booking
    // ----------------------------------------------------

    if (
      booking.status === 'completed'
    ) {
      return res.status(400).json({
        message:
          'A completed booking cannot be rescheduled'
      });
    }


    // ----------------------------------------------------
    // Reason validation
    // ----------------------------------------------------

    const rescheduleReason =
      typeof reason === 'string'
        ? reason.trim()
        : '';

    if (rescheduleReason.length > 500) {
      return res.status(400).json({
        message:
          'Reschedule reason cannot exceed 500 characters'
      });
    }


    // ----------------------------------------------------
    // Save old schedule in history
    // ----------------------------------------------------

    const previousScheduledAt =
      booking.scheduledAt;

    booking.rescheduleHistory.push({
      previousScheduledAt,
      newScheduledAt,
      reason: rescheduleReason,
      changedBy: req.user.id,
      changedAt: new Date()
    });


    // ----------------------------------------------------
    // Update booking schedule
    // ----------------------------------------------------

    booking.scheduledAt =
      newScheduledAt;

    await booking.save();


    // ----------------------------------------------------
    // Response
    // ----------------------------------------------------

    res.status(200).json({
      message:
        'Booking rescheduled successfully',
      booking
    });

  } catch (err) {
    console.error(
      'Error rescheduling booking:',
      err
    );

    res.status(500).json({
      message:
        'Server error rescheduling booking',
      error: err.message
    });
  }
};


// ============================================================
// SUBMIT CUSTOMER FEEDBACK
// POST /api/bookings/:id/feedback
// ============================================================

const submitFeedback = async (
  req,
  res
) => {
  try {
    const { rating, comment } =
      req.body;

    if (
      !rating ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        message:
          'Rating must be between 1 and 5'
      });
    }

    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    if (
      booking.customer.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          'You can only submit feedback for your own bookings'
      });
    }

    if (
      booking.status !== 'completed'
    ) {
      return res.status(400).json({
        message:
          'Feedback can only be submitted after the service is completed'
      });
    }

    if (
      booking.feedback &&
      booking.feedback.rating
    ) {
      return res.status(400).json({
        message:
          'Feedback has already been submitted for this booking'
      });
    }

    booking.feedback = {
      rating,
      comment
    };

    await booking.save();

    if (booking.worker) {
      const worker =
        await Worker.findById(
          booking.worker
        );

      if (worker) {
        const currentCount =
          worker.rating?.count || 0;

        const currentAverage =
          worker.rating?.average || 0;

        const newCount =
          currentCount + 1;

        const newAverage =
          (
            currentAverage *
              currentCount +
            Number(rating)
          ) / newCount;

        worker.rating = {
          average: newAverage,
          count: newCount
        };

        await worker.save();
      }
    }

    res.status(200).json({
      message:
        'Feedback submitted successfully',
      booking
    });

  } catch (err) {
    console.error(
      'Error submitting feedback:',
      err
    );

    res.status(500).json({
      message:
        'Server error submitting feedback',
      error: err.message
    });
  }
};


// ============================================================
// MARK PAYMENT AS PAID
// PATCH /api/bookings/:id/payment
// ============================================================

const markPaymentAsPaid = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    if (
      booking.customer.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          'You can only pay for your own bookings'
      });
    }

    if (
      booking.payment.status === 'paid'
    ) {
      return res.status(400).json({
        message:
          'Payment has already been completed'
      });
    }

    booking.payment.status = 'paid';

    await booking.save();

    res.status(200).json({
      message:
        'Payment completed successfully',
      booking
    });

  } catch (err) {
    console.error(
      'Payment error:',
      err
    );

    res.status(500).json({
      message:
        'Server error processing payment',
      error: err.message
    });
  }
};


// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {
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
};