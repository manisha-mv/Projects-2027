const express = require('express');
const { getPatients, registerEmergency, updateStatus } = require('../controllers/emergency.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Emergency Patients
router.get('/patients', getPatients);
router.post('/patients', authorize('super_admin', 'admin', 'doctor', 'nurse', 'receptionist'), registerEmergency);
router.put('/patients/:id', authorize('super_admin', 'admin', 'doctor', 'nurse'), updateStatus);

module.exports = router;
