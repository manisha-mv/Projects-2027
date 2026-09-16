// src/routes/dashboard.routes.js
const express = require('express');
const { getDashboardStats, getDashboardActivity, getDashboardCensus } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

router.get('/stats',    getDashboardStats);
router.get('/activity', getDashboardActivity);
router.get('/census',   getDashboardCensus);

module.exports = router;
