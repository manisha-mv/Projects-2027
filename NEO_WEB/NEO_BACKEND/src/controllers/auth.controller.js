// src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logAuditEvent } = require('../utils/eventLogger');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'NEO_HMS_jwt_secret_key_2026_change_me', {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, department, phone, employeeId } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: (role || 'RECEPTIONIST').toUpperCase(),
      department,
      phone,
      employeeId,
    });

    const token = signToken(user._id);

    await logAuditEvent({
      user,
      action: 'Register',
      module: 'Auth',
      description: `New user account created for ${user.email} (${user.role})`,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        email: user.email,
        name: user.fullName,
        role: user.role,
        department: user.department,
        initials: user.initials,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    await logAuditEvent({
      user,
      action: 'Login',
      module: 'Auth',
      description: `User ${user.email} logged in successfully`,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        email: user.email,
        name: user.fullName,
        role: user.role,
        department: user.department,
        initials: user.initials,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        email: user.email,
        name: user.fullName,
        role: user.role,
        department: user.department,
        initials: user.initials,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logAuditEvent({
        user: req.user,
        action: 'Logout',
        module: 'Auth',
        description: `User ${req.user.email} logged out`,
      });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
