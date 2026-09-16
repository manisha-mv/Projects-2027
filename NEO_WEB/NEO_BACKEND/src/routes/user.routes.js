const express = require('express');
const { body, param } = require('express-validator');
const {
  getUsers, getUserById, createUser, updateUser, deleteUser, getDoctors,
} = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { ROLES } = require('../models/User');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/users/doctors — accessible by any authenticated user (for appointment booking)
router.get('/doctors', getDoctors);

// GET /api/users — admin and super_admin only
router.get('/', authorize('super_admin', 'admin'), getUsers);

// GET /api/users/:id
router.get(
  '/:id',
  authorize('super_admin', 'admin'),
  [param('id').isMongoId().withMessage('Invalid user ID'), validate],
  getUserById
);

// POST /api/users — super_admin and admin only
router.post(
  '/',
  authorize('super_admin', 'admin'),
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('role').isIn(ROLES).withMessage(`Role must be one of: ${ROLES.join(', ')}`),
    validate,
  ],
  createUser
);

// PUT /api/users/:id
router.put(
  '/:id',
  authorize('super_admin', 'admin'),
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('role').optional().isIn(ROLES).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    validate,
  ],
  updateUser
);

// DELETE /api/users/:id (soft delete — deactivate)
router.delete(
  '/:id',
  authorize('super_admin', 'admin'),
  [param('id').isMongoId().withMessage('Invalid user ID'), validate],
  deleteUser
);

module.exports = router;
