const express = require('express');
const { getFollowups, createFollowup, markComplete } = require('../controllers/followup.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', getFollowups);
router.post('/', authorize('super_admin', 'admin', 'doctor', 'receptionist'), createFollowup);
router.put('/:id/complete', authorize('super_admin', 'admin', 'doctor', 'nurse'), markComplete);

module.exports = router;
