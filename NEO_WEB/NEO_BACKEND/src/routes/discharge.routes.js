const express = require('express');
const { getDischarges, createDischarge, updateDischarge } = require('../controllers/discharge.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', getDischarges);
router.post('/', authorize('super_admin', 'admin', 'doctor'), createDischarge);
router.put('/:id', authorize('super_admin', 'admin', 'doctor', 'nurse'), updateDischarge);

module.exports = router;
