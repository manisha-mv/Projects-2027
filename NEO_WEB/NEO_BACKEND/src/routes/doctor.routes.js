const express = require('express');
const { getDoctors, getDoctorById, createDoctor, updateDoctor } = require('../controllers/doctor.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/doctors
router.get('/', getDoctors);

// GET /api/doctors/:id
router.get('/:id', getDoctorById);

// POST /api/doctors
router.post('/', authorize('super_admin', 'admin'), createDoctor);

// PUT /api/doctors/:id
router.put('/:id', authorize('super_admin', 'admin'), updateDoctor);

module.exports = router;
