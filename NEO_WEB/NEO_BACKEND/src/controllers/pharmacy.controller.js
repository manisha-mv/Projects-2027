// src/controllers/pharmacy.controller.js
const { Prescription, Medicine } = require('../models/Pharmacy');
const { logTraceabilityEvent, logAuditEvent } = require('../utils/eventLogger');

// ─── Prescriptions ─────────────────────────────────────────────────────────────
exports.getPrescriptions = async (req, res, next) => {
  try {
    const { search = '', status = '', page = 1, limit = 20 } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { prescriptionId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'All') query.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Prescription.countDocuments(query);
    const prescriptions = await Prescription.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: prescriptions,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.createPrescription = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.prescriptionId) {
      const count = await Prescription.countDocuments();
      data.prescriptionId = `RX-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }
    if (!data.prescribedDate) {
      data.prescribedDate = new Date().toISOString().split('T')[0];
    }

    const rx = await Prescription.create(data);

    await logTraceabilityEvent({
      patientId: rx.patientId,
      patientName: rx.patientName,
      type: 'PRESCRIPTION_CREATED',
      department: 'Pharmacy',
      performedBy: req.user ? req.user.fullName : 'Doctor',
      role: 'DOCTOR',
      description: `Prescription ${rx.prescriptionId} created with ${rx.medicines?.length || 0} items`,
      relatedId: rx.prescriptionId,
    });

    res.status(201).json({ success: true, data: rx });
  } catch (error) {
    next(error);
  }
};

exports.dispenseMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { medicines } = req.body; // updated medicines array with dispensed quantities

    const rx = await Prescription.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { prescriptionId: id }],
    });

    if (!rx) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Process dispensing & deduct medicine inventory
    if (medicines && Array.isArray(medicines)) {
      rx.medicines = medicines;

      for (const medItem of medicines) {
        const qtyToDispense = medItem.dispensedNow || 0;
        if (qtyToDispense > 0) {
          // Find matching medicine inventory item by name
          const inventoryItem = await Medicine.findOne({ name: { $regex: new RegExp(`^${medItem.name}`, 'i') } });
          if (inventoryItem) {
            inventoryItem.quantity = Math.max(0, inventoryItem.quantity - qtyToDispense);
            if (inventoryItem.quantity <= inventoryItem.minStock) {
              inventoryItem.status = 'Low Stock';
            }
            await inventoryItem.save();
          }
        }
      }
    }

    const allDispensed = rx.medicines.every(m => m.dispensed >= m.quantity);
    rx.status = allDispensed ? 'Dispensed' : 'Partially Dispensed';
    rx.dispensedAt = new Date();
    rx.dispensedBy = req.user ? req.user.fullName : 'Pharmacist';

    await rx.save();

    await logTraceabilityEvent({
      patientId: rx.patientId,
      patientName: rx.patientName,
      type: 'MEDICINE_DISPENSED',
      department: 'Pharmacy',
      performedBy: req.user ? req.user.fullName : 'Pharmacist',
      role: 'PHARMACIST',
      description: `Medicines dispensed for prescription ${rx.prescriptionId}`,
      relatedId: rx.prescriptionId,
    });

    await logAuditEvent({
      user: req.user,
      action: 'Dispense',
      module: 'Pharmacy',
      patientId: rx.patientId,
      patientName: rx.patientName,
      description: `Dispensed medications for prescription ${rx.prescriptionId}`,
    });

    res.json({ success: true, data: rx });
  } catch (error) {
    next(error);
  }
};

// ─── Inventory ─────────────────────────────────────────────────────────────────
exports.getInventory = async (req, res, next) => {
  try {
    const { search = '', category = '', status = '', page = 1, limit = 20 } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { batchNo: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: medicines,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.addMedicine = async (req, res, next) => {
  try {
    const data = req.body;
    if (data.expiryDate && new Date(data.expiryDate) < new Date()) {
      data.status = 'Expired';
    } else if (data.quantity <= (data.minStock || 20)) {
      data.status = 'Low Stock';
    } else {
      data.status = 'In Stock';
    }

    const med = await Medicine.create(data);
    res.status(201).json({ success: true, data: med });
  } catch (error) {
    next(error);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantityChange } = req.body;

    const med = await Medicine.findById(id);
    if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });

    med.quantity = Math.max(0, med.quantity + parseInt(quantityChange, 10));
    if (new Date(med.expiryDate) < new Date()) {
      med.status = 'Expired';
    } else if (med.quantity <= med.minStock) {
      med.status = 'Low Stock';
    } else {
      med.status = 'In Stock';
    }

    await med.save();
    res.json({ success: true, data: med });
  } catch (error) {
    next(error);
  }
};

exports.getPrescriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rx = await Prescription.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { prescriptionId: id }],
    });
    if (!rx) return res.status(404).json({ success: false, message: 'Prescription not found' });
    res.json({ success: true, data: rx });
  } catch (error) {
    next(error);
  }
};

exports.getPharmacyHistory = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const query = { status: { $in: ['Dispensed', 'Partially Dispensed', 'completed', 'Completed'] } };
    if (search.trim()) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { prescriptionId: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Prescription.countDocuments(query);
    const history = await Prescription.find(query).sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit, 10));
    res.json({
      success: true,
      data: history,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) },
    });
  } catch (error) {
    next(error);
  }
};

