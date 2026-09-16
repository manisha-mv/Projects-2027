const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settings.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', getSettings);
router.put('/', authorize('super_admin', 'admin'), updateSettings);

module.exports = router;
