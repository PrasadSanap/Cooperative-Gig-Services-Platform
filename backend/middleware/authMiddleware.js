const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Not authorized, no token'
    });
  }

  try {
    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev_secret'
    );

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Not authorized, token invalid'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden: you do not have permission to access this resource'
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
};