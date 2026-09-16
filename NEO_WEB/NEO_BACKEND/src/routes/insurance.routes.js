const express = require('express');
const { getClaims, createClaim, updateClaim, getPolicies, createPolicy } = require('../controllers/insurance.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/claims', getClaims);
router.post('/claims', authorize('super_admin', 'admin', 'billing', 'receptionist'), createClaim);
router.put('/claims/:id', authorize('super_admin', 'admin', 'billing'), updateClaim);

router.get('/policies', getPolicies);
router.post('/policies', authorize('super_admin', 'admin', 'billing', 'receptionist'), createPolicy);

module.exports = router;
