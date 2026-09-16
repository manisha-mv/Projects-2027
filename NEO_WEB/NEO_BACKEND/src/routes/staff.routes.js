const express = require('express');
const { getStaff, createStaff, updateStaff } = require('../controllers/staff.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', getStaff);
router.post('/', authorize('super_admin', 'admin'), createStaff);
router.put('/:id', authorize('super_admin', 'admin'), updateStaff);

module.exports = router;
