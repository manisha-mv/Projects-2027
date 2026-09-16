const express = require('express');
const { getPatientTrace, getAllTrace } = require('../controllers/traceability.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', getAllTrace);
router.get('/:patientId', getPatientTrace);

module.exports = router;
