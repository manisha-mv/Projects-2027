const express = require('express');
const { getAdmissions, getBeds, admitPatient, transferPatient, dischargePatient } = require('../controllers/ipd.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Beds
router.get('/beds', getBeds);

// Admissions
router.get('/admissions', getAdmissions);
router.post('/admissions', authorize('super_admin', 'admin', 'doctor', 'nurse', 'receptionist'), admitPatient);
router.put('/admissions/:id/transfer', authorize('super_admin', 'admin', 'doctor', 'nurse'), transferPatient);
router.put('/admissions/:id/discharge', authorize('super_admin', 'admin', 'doctor', 'nurse'), dischargePatient);

module.exports = router;
