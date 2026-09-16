const express = require('express');
const { getDepartments, createDepartment, updateDepartment } = require('../controllers/department.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', getDepartments);
router.post('/', authorize('super_admin', 'admin'), createDepartment);
router.put('/:id', authorize('super_admin', 'admin'), updateDepartment);

module.exports = router;
