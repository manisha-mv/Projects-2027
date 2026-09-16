const express = require('express');
const { getNotifications, markRead, markAllRead, createNotification } = require('../controllers/notification.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', getNotifications);
router.put('/mark-all-read', markAllRead);
router.put('/:id/read', markRead);
router.post('/', authorize('super_admin', 'admin'), createNotification);

module.exports = router;
