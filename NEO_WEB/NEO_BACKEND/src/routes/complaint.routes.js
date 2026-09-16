const express = require('express');
const { getComplaints, createComplaint, updateComplaint } = require('../controllers/complaint.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', getComplaints);
router.post('/', authenticate, createComplaint);
router.put('/:id', authorize('super_admin', 'admin'), updateComplaint);

module.exports = router;
