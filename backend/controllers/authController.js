const User = require('../models/User');
const Worker = require('../models/Worker');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      cooperativeId,
      skills,
      experienceYears,
      bio
    } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: 'Name, email, phone and password are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: phone.trim() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email or phone number'
      });
    }

    const allowedRoles = ['customer', 'worker', 'admin'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    if (userRole === 'worker' && !cooperativeId) {
      return res.status(400).json({
        message: 'Cooperative ID is required for worker registration'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      passwordHash: password,
      role: userRole
    });

    let worker = null;

    if (userRole === 'worker') {
      worker = await Worker.create({
        user: user._id,
        cooperativeId: cooperativeId.trim(),
        skills: Array.isArray(skills) ? skills : [],
        experienceYears: Number(experienceYears) || 0,
        bio: bio?.trim() || '',
        availability: 'offline'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      worker: worker
        ? {
            id: worker._id,
            cooperativeId: worker.cooperativeId,
            skills: worker.skills,
            availability: worker.availability
          }
        : null
    });
  } catch (error) {
    console.error('Registration error:', error);

    res.status(500).json({
      message: 'Server error during registration'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      message: 'Server error during login'
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferredLanguage: user.preferredLanguage
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);

    res.status(500).json({
      message: 'Server error fetching profile'
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
