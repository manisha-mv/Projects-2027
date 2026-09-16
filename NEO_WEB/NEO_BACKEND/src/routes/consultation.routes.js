const express = require('express');
const { createConsultation, getConsultations } = require('../controllers/consultation.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/consultations
router.get('/', getConsultations);

// POST /api/consultations
router.post('/', authorize('super_admin', 'admin', 'doctor'), createConsultation);

module.exports = router;
