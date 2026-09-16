const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * authenticate — Verifies JWT and attaches req.user.
 */
const authenticate = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'NEO_HMS_jwt_secret_key_2026_change_me');
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Invalid token. Please log in again.';
    return res.status(401).json({ success: false, message });
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User no longer exists.',
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated. Contact an administrator.',
    });
  }

  req.user = user;
  next();
};

/**
 * authorize — Checks if req.user has one of the allowed roles (case-insensitive & alias mapping).
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const normalizedAllowed = roles.flatMap(r => [r.toUpperCase(), r.toLowerCase()]);

    // ADMIN has full authorized access
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      return next();
    }

    if (!normalizedAllowed.includes(userRole) && !normalizedAllowed.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role ${req.user.role} is not authorized for this resource.`,
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
