const express = require('express');
const { getInventory, updateInventory, getRequests, createRequest, issueBlood } = require('../controllers/bloodBank.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/inventory', getInventory);
router.put('/inventory/:bloodGroup', authorize('super_admin', 'admin', 'lab_technician'), updateInventory);

router.get('/requests', getRequests);
router.post('/requests', authorize('super_admin', 'admin', 'doctor', 'nurse'), createRequest);
router.post('/requests/:id/issue', authorize('super_admin', 'admin', 'lab_technician'), issueBlood);

module.exports = router;
