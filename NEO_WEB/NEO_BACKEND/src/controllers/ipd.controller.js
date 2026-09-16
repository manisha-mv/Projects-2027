// src/controllers/ipd.controller.js
const { Admission, Bed } = require('../models/IPD');
const Patient = require('../models/Patient');
const { logTraceabilityEvent, logAuditEvent } = require('../utils/eventLogger');

exports.getAdmissions = async (req, res, next) => {
  try {
    const { search = '', ward = '', status = 'Active', page = 1, limit = 20 } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { admissionId: { $regex: search, $options: 'i' } },
      ];
    }
    if (ward && ward !== 'All') query.ward = ward;
    if (status && status !== 'All') query.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Admission.countDocuments(query);
    const admissions = await Admission.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: admissions,
      pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBeds = async (req, res, next) => {
  try {
    const { ward = '' } = req.query;
    const query = {};
    if (ward) query.ward = ward;

    const beds = await Bed.find(query).sort({ bedId: 1 });
    const stats = {
      total: beds.length,
      available: beds.filter(b => b.status === 'Available').length,
      occupied: beds.filter(b => b.status === 'Occupied').length,
      maintenance: beds.filter(b => b.status === 'Maintenance').length,
    };

    res.json({ success: true, data: beds, stats });
  } catch (error) {
    next(error);
  }
};

exports.admitPatient = async (req, res, next) => {
  try {
    const data = req.body;

    // Check if bed is already occupied (duplicate active bed allocation prevention)
    const bed = await Bed.findOne({ $or: [{ bedId: data.bedId }, { _id: data.bedId.match(/^[0-9a-fA-F]{24}$/) ? data.bedId : null }] });
    if (bed && bed.status === 'Occupied') {
      return res.status(400).json({ success: false, message: `Bed ${bed.bedId} is currently occupied.` });
    }

    if (!data.admissionId) {
      const count = await Admission.countDocuments();
      data.admissionId = `ADM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }
    if (!data.admitDate) {
      data.admitDate = new Date().toISOString().split('T')[0];
    }

    const admission = await Admission.create(data);

    // Update Bed Status
    if (bed) {
      bed.status = 'Occupied';
      bed.patientId = admission.patientId;
      bed.patientName = admission.patientName;
      await bed.save();
    }

    // Update Patient Status
    await Patient.findOneAndUpdate({ patientId: admission.patientId }, { status: 'Inpatient' });

    await logTraceabilityEvent({
      patientId: admission.patientId,
      patientName: admission.patientName,
      type: 'ADMISSION_CREATED',
      department: admission.ward,
      performedBy: req.user ? req.user.fullName : 'Doctor',
      role: req.user ? req.user.role : 'DOCTOR',
      description: `Patient admitted to ${admission.ward} (Bed ${admission.bedId})`,
      relatedId: admission.admissionId,
    });

    await logAuditEvent({
      user: req.user,
      action: 'Admit',
      module: 'IPD',
      patientId: admission.patientId,
      patientName: admission.patientName,
      description: `Admitted patient ${admission.patientName} to ${admission.ward}`,
    });

    res.status(201).json({ success: true, data: admission });
  } catch (error) {
    next(error);
  }
};

exports.transferPatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newBedId, notes } = req.body;

    const admission = await Admission.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { admissionId: id }],
    });

    if (!admission) return res.status(404).json({ success: false, message: 'Admission record not found' });

    // Free old bed
    await Bed.findOneAndUpdate({ bedId: admission.bedId }, { status: 'Available', patientId: null, patientName: null });

    // Occupy new bed
    const newBed = await Bed.findOneAndUpdate(
      { bedId: newBedId },
      { status: 'Occupied', patientId: admission.patientId, patientName: admission.patientName },
      { new: true }
    );

    admission.bedId = newBedId;
    if (newBed) admission.ward = newBed.ward;
    if (notes) admission.notes = notes;
    await admission.save();

    await logTraceabilityEvent({
      patientId: admission.patientId,
      patientName: admission.patientName,
      type: 'BED_ASSIGNED',
      department: admission.ward,
      performedBy: req.user ? req.user.fullName : 'Nurse',
      role: 'NURSE',
      description: `Transferred to Bed ${newBedId} (${admission.ward})`,
      relatedId: admission.admissionId,
    });

    res.json({ success: true, data: admission });
  } catch (error) {
    next(error);
  }
};

exports.dischargePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const admission = await Admission.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { admissionId: id }] },
      { status: 'Discharged', dischargeDate: new Date().toISOString().split('T')[0] },
      { new: true }
    );

    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

    // Free bed
    await Bed.findOneAndUpdate({ bedId: admission.bedId }, { status: 'Available', patientId: null, patientName: null });

    // Update patient status
    await Patient.findOneAndUpdate({ patientId: admission.patientId }, { status: 'Discharged' });

    res.json({ success: true, data: admission });
  } catch (error) {
    next(error);
  }
};
