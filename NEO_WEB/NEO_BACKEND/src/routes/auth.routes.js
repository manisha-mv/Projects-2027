const express = require('express');
const { body } = require('express-validator');
const { login, getMe, logout } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  login
);

// GET /api/auth/me — requires authentication
router.get('/me', authenticate, getMe);

// POST /api/auth/logout
router.post('/logout', authenticate, logout);

module.exports = router;
