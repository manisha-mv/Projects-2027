const express = require('express');
const { body, param } = require('express-validator');
const {
  createAppointment, getAppointments, getAppointmentById,
  updateAppointment, getDoctorSlots, getAppointmentStats,
} = require('../controllers/appointment.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
router.use(authenticate);

// GET /api/appointments/stats
router.get(
  '/stats',
  authorize('super_admin', 'admin', 'receptionist', 'doctor'),
  getAppointmentStats
);

// GET /api/appointments/slots?doctorId=&date=
router.get('/slots', getDoctorSlots);

// GET /api/appointments
router.get(
  '/',
  authorize('super_admin', 'admin', 'receptionist', 'doctor', 'nurse'),
  getAppointments
);

// POST /api/appointments
router.post(
  '/',
  authorize('super_admin', 'admin', 'receptionist', 'doctor'),
  [
    body('patientId').isMongoId().withMessage('Valid patient ID is required'),
    body('doctorId').isMongoId().withMessage('Valid doctor ID is required'),
    body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
    body('timeSlot').trim().notEmpty().withMessage('Time slot is required'),
    body('type')
      .optional()
      .isIn(['New Visit', 'Follow-up', 'Emergency', 'Teleconsultation'])
      .withMessage('Invalid appointment type'),
    validate,
  ],
  createAppointment
);

// GET /api/appointments/:id
router.get(
  '/:id',
  authorize('super_admin', 'admin', 'receptionist', 'doctor', 'nurse'),
  [param('id').isMongoId().withMessage('Invalid appointment ID'), validate],
  getAppointmentById
);

// PUT /api/appointments/:id
router.put(
  '/:id',
  authorize('super_admin', 'admin', 'receptionist', 'doctor'),
  [
    param('id').isMongoId().withMessage('Invalid appointment ID'),
    body('status')
      .optional()
      .isIn(['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show'])
      .withMessage('Invalid status'),
    validate,
  ],
  updateAppointment
);

module.exports = router;
