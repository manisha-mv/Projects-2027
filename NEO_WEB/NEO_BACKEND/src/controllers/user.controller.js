const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { createAuditLog } = require('../middleware/auditLogger');

const SAFE_USER_FIELDS = '-password -__v';

// ─── Format user for response ─────────────────────────────────────────────────
const formatUser = (user) => ({
  id: user._id,
  employeeId: user.employeeId,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  department: user.department,
  phone: user.phone,
  isActive: user.isActive,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  createdBy: user.createdBy,
});

// ─── GET /api/users ───────────────────────────────────────────────────────────
const getUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(filter)
      .select(SAFE_USER_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName role'),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: users.map(formatUser),
  });
});

// ─── GET /api/users/:id ───────────────────────────────────────────────────────
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select(SAFE_USER_FIELDS)
    .populate('createdBy', 'firstName lastName role');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  res.status(200).json({ success: true, data: formatUser(user) });
});

// ─── POST /api/users ──────────────────────────────────────────────────────────
const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, department, phone, employeeId } = req.body;

  // Check if email already exists
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'A user with this email already exists.',
    });
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role,
    department,
    phone,
    employeeId,
    createdBy: req.user._id,
  });

  await createAuditLog({
    user: req.user,
    action: 'CREATE',
    entity: 'User',
    entityId: user._id,
    details: { email: user.email, role: user.role },
    req,
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully.',
    data: formatUser(user),
  });
});

// ─── PUT /api/users/:id ───────────────────────────────────────────────────────
const updateUser = asyncHandler(async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'department', 'phone', 'role', 'isActive', 'employeeId'];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  // Prevent self-deactivation
  if (req.params.id === String(req.user._id) && updates.isActive === false) {
    return res.status(400).json({
      success: false,
      message: 'You cannot deactivate your own account.',
    });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const before = { role: user.role, isActive: user.isActive, department: user.department };
  Object.assign(user, updates);
  await user.save({ validateBeforeSave: true });

  await createAuditLog({
    user: req.user,
    action: 'UPDATE',
    entity: 'User',
    entityId: user._id,
    details: { before, after: updates },
    req,
  });

  res.status(200).json({
    success: true,
    message: 'User updated successfully.',
    data: formatUser(user),
  });
});

// ─── DELETE /api/users/:id (soft delete) ─────────────────────────────────────
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'You cannot deactivate your own account.',
    });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  await createAuditLog({
    user: req.user,
    action: 'DELETE',
    entity: 'User',
    entityId: user._id,
    details: { deactivated: true, email: user.email },
    req,
  });

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully.',
  });
});

// ─── GET /api/users/doctors — for appointment booking ────────────────────────
const getDoctors = asyncHandler(async (req, res) => {
  const { department } = req.query;
  const filter = { role: 'doctor', isActive: true };
  if (department) filter.department = { $regex: department, $options: 'i' };

  const doctors = await User.find(filter).select('firstName lastName department email phone employeeId');
  res.status(200).json({ success: true, data: doctors });
});

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, getDoctors };
