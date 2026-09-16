const express = require('express');
const { getAuditLogs } = require('../controllers/audit.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/audit — super_admin and admin only
router.get('/', authorize('super_admin', 'admin'), getAuditLogs);

module.exports = router;
