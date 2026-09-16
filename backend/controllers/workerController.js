const Worker = require('../models/Worker');

const getMyWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user.id })
      .populate('user', 'name email phone role preferredLanguage');

    if (!worker) {
      return res.status(404).json({
        message: 'Worker profile not found'
      });
    }

    res.status(200).json({
      worker
    });
  } catch (error) {
    console.error('Get worker profile error:', error);

    res.status(500).json({
      message: 'Server error fetching worker profile'
    });
  }
};

const updateMyWorkerProfile = async (req, res) => {
  try {
    const { skills, experienceYears, bio } = req.body;

    const worker = await Worker.findOne({ user: req.user.id });

    if (!worker) {
      return res.status(404).json({
        message: 'Worker profile not found'
      });
    }

    if (skills !== undefined) {
      worker.skills = skills;
    }

    if (experienceYears !== undefined) {
      worker.experienceYears = Number(experienceYears);
    }

    if (bio !== undefined) {
      worker.bio = bio;
    }

    await worker.save();

    res.status(200).json({
      message: 'Worker profile updated successfully',
      worker
    });
  } catch (error) {
    console.error('Update worker profile error:', error);

    res.status(500).json({
      message: 'Server error updating worker profile'
    });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const allowedAvailability = ['available', 'busy', 'offline'];

    if (!allowedAvailability.includes(availability)) {
      return res.status(400).json({
        message: 'Availability must be available, busy, or offline'
      });
    }

    const worker = await Worker.findOne({ user: req.user.id });

    if (!worker) {
      return res.status(404).json({
        message: 'Worker profile not found'
      });
    }

    worker.availability = availability;

    await worker.save();

    res.status(200).json({
      message: 'Availability updated successfully',
      availability: worker.availability
    });
  } catch (error) {
    console.error('Update availability error:', error);

    res.status(500).json({
      message: 'Server error updating availability'
    });
  }
};

const updateCurrentLocation = async (req, res) => {
  try {
    const { lng, lat } = req.body;

    if (lng === undefined || lat === undefined) {
      return res.status(400).json({
        message: 'Longitude and latitude are required'
      });
    }

    const longitude = Number(lng);
    const latitude = Number(lat);

    if (
      Number.isNaN(longitude) ||
      Number.isNaN(latitude) ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      return res.status(400).json({
        message: 'Invalid longitude or latitude'
      });
    }

    const worker = await Worker.findOne({ user: req.user.id });

    if (!worker) {
      return res.status(404).json({
        message: 'Worker profile not found'
      });
    }

    worker.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };

    await worker.save();

    res.status(200).json({
      message: 'Worker location updated successfully',
      currentLocation: worker.currentLocation
    });
  } catch (error) {
    console.error('Update worker location error:', error);

    res.status(500).json({
      message: 'Server error updating worker location'
    });
  }
};

module.exports = {
  getMyWorkerProfile,
  updateMyWorkerProfile,
  updateAvailability,
  updateCurrentLocation
};