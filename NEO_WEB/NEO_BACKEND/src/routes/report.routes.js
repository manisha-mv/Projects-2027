const express = require('express');
const { getReports } = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', getReports);

module.exports = router;
