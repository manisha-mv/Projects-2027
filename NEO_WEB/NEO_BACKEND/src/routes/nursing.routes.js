const express = require('express');
const {
  getAssignedPatients, getMedicationTasks, completeTask, recordVitals, getVitals, createNote, getNotes
} = require('../controllers/nursing.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Patients & Tasks
router.get('/patients', getAssignedPatients);
router.get('/tasks', getMedicationTasks);
router.put('/tasks/:id/complete', authorize('super_admin', 'admin', 'nurse'), completeTask);

// Vitals
router.get('/vitals', getVitals);
router.post('/vitals', authorize('super_admin', 'admin', 'nurse', 'doctor'), recordVitals);

// Notes
router.get('/notes', getNotes);
router.post('/notes', authorize('super_admin', 'admin', 'nurse', 'doctor'), createNote);

module.exports = router;
