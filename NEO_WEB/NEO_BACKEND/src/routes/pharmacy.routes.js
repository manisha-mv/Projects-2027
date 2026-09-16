const express = require('express');
const {
  getPrescriptions, createPrescription, dispenseMedicine,
  getInventory, addMedicine, updateStock, getPrescriptionById, getPharmacyHistory
} = require('../controllers/pharmacy.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Prescriptions
router.get('/prescriptions', getPrescriptions);
router.post('/prescriptions', authorize('super_admin', 'admin', 'doctor'), createPrescription);
router.get('/prescriptions/:id', getPrescriptionById);
router.post('/prescriptions/:prescriptionId/dispense', authorize('super_admin', 'admin', 'pharmacist'), dispenseMedicine);
router.get('/history', getPharmacyHistory);

// Inventory
router.get('/inventory', getInventory);
router.post('/inventory', authorize('super_admin', 'admin', 'pharmacist'), addMedicine);
router.post('/inventory/:id/stock', authorize('super_admin', 'admin', 'pharmacist'), updateStock);

module.exports = router;
