// src/controllers/nursing.controller.js
const { Vitals, NursingNote, MedicationTask } = require('../models/Nursing');
const { Admission } = require('../models/IPD');
const { logTraceabilityEvent, logAuditEvent } = require('../utils/eventLogger');

exports.getAssignedPatients = async (req, res, next) => {
  try {
    const admissions = await Admission.find({ status: 'Active' });
    const tasks = await MedicationTask.find({ status: 'Pending' });

    const patientsMap = {};
    admissions.forEach((a) => {
      patientsMap[a.patientId] = {
        patientId: a.patientId,
        patientName: a.patientName,
        ward: a.ward,
        bed: a.bedId,
        pendingTasks: 0,
      };
    });

    tasks.forEach((t) => {
      if (patientsMap[t.patientId]) {
        patientsMap[t.patientId].pendingTasks += 1;
      }
    });

    res.json({ success: true, data: Object.values(patientsMap) });
  } catch (error) {
    next(error);
  }
};

exports.getMedicationTasks = async (req, res, next) => {
  try {
    const { status = '' } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;

    const tasks = await MedicationTask.find(query).sort({ scheduledTime: 1 });
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

exports.completeTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await MedicationTask.findByIdAndUpdate(
      id,
      { status: 'Completed', completedAt: new Date(), givenBy: req.user ? req.user.fullName : 'Nurse' },
      { new: true }
    );

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    await logTraceabilityEvent({
      patientId: task.patientId,
      patientName: task.patientName,
      type: 'NURSING_ACTIVITY',
      department: 'Nursing',
      performedBy: req.user ? req.user.fullName : 'Nurse',
      role: 'NURSE',
      description: `Medication ${task.medicine} (${task.dosage}) administered`,
      relatedId: task._id.toString(),
    });

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

exports.recordVitals = async (req, res, next) => {
  try {
    const data = req.body;
    if (req.user) data.recordedBy = req.user.fullName;

    const isCritical = (data.spo2 && data.spo2 < 92) || (data.pulse && (data.pulse < 50 || data.pulse > 120));
    if (isCritical) data.isCritical = true;

    const vitals = await Vitals.create(data);

    await logTraceabilityEvent({
      patientId: vitals.patientId,
      patientName: vitals.patientName,
      type: 'VITALS_RECORDED',
      department: 'Nursing',
      performedBy: vitals.recordedBy,
      role: 'NURSE',
      status: isCritical ? 'Critical' : 'Normal',
      description: `Vitals recorded — BP: ${vitals.bp}, Pulse: ${vitals.pulse}, SpO2: ${vitals.spo2}%`,
      relatedId: vitals._id.toString(),
    });

    res.status(201).json({ success: true, data: vitals });
  } catch (error) {
    next(error);
  }
};

exports.getVitals = async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const query = patientId ? { patientId } : {};
    const vitals = await Vitals.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: vitals });
  } catch (error) {
    next(error);
  }
};

exports.createNote = async (req, res, next) => {
  try {
    const data = req.body;
    if (req.user) data.author = req.user.fullName;
    const note = await NursingNote.create(data);

    await logTraceabilityEvent({
      patientId: note.patientId,
      patientName: note.patientName,
      type: 'NURSING_ACTIVITY',
      department: 'Nursing',
      performedBy: note.author || 'Nurse',
      role: 'NURSE',
      description: `Nursing Note added: ${note.note?.slice(0, 50)}...`,
      relatedId: note._id.toString(),
    });

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

exports.getNotes = async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const query = patientId ? { patientId } : {};
    const notes = await NursingNote.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};

