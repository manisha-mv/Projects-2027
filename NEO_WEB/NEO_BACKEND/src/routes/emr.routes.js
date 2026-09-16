const express = require('express');
const { getEMR } = require('../controllers/emr.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/:patientId', getEMR);

module.exports = router;
