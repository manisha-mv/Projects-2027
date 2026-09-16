const express = require('express');
const { getSurgeries, scheduleSurgery, updateSurgery } = require('../controllers/surgery.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Surgery & OT
router.get('/', getSurgeries);
router.post('/', authorize('super_admin', 'admin', 'doctor'), scheduleSurgery);
router.put('/:id', authorize('super_admin', 'admin', 'doctor', 'nurse'), updateSurgery);

module.exports = router;
