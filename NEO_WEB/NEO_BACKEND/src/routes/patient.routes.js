const express = require('express');
const { body, param, query } = require('express-validator');
const {
  registerPatient, getPatients, getPatientById,
  updatePatient, getPatientTimeline, getPatientStats,
} = require('../controllers/patient.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
router.use(authenticate);

// GET /api/patients/stats
router.get('/stats', authorize('super_admin', 'admin', 'receptionist', 'doctor', 'nurse'), getPatientStats);

// GET /api/patients
router.get(
  '/',
  authorize('super_admin', 'admin', 'receptionist', 'doctor', 'nurse', 'lab_technician', 'radiologist', 'pharmacist'),
  getPatients
);

// POST /api/patients
router.post(
  '/',
  authorize('super_admin', 'admin', 'receptionist'),
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required (ISO 8601)'),
    body('gender')
      .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
      .withMessage('Gender must be Male, Female, Other, or Prefer not to say'),
    body('contact.phone').trim().notEmpty().withMessage('Phone number is required'),
    validate,
  ],
  registerPatient
);

// GET /api/patients/:id
router.get(
  '/:id',
  authorize('super_admin', 'admin', 'receptionist', 'doctor', 'nurse', 'lab_technician', 'radiologist', 'pharmacist'),
  getPatientById
);

// GET /api/patients/:id/timeline
router.get(
  '/:id/timeline',
  authorize('super_admin', 'admin', 'doctor', 'nurse'),
  getPatientTimeline
);

// PUT /api/patients/:id
router.put(
  '/:id',
  authorize('super_admin', 'admin', 'receptionist', 'doctor'),
  updatePatient
);

module.exports = router;
