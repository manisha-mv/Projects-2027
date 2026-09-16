// src/controllers/doctor.controller.js
const User = require('../models/User');
const { logAuditEvent } = require('../utils/eventLogger');

// GET /api/doctors
exports.getDoctors = async (req, res, next) => {
  try {
    const { search = '', department = '', status = '', page = 1, limit = 20 } = req.query;
    const filter = { role: { $in: ['DOCTOR', 'doctor'] } };

    if (search.trim()) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'All') {
      filter.department = department;
    }

    if (status && status !== 'All') {
      filter.isActive = status === 'Active';
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(filter);
    const doctors = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Map fields to match frontend doctor expectations
    const mappedDoctors = doctors.map(doc => ({
      id: doc._id,
      doctorId: doc.employeeId || `D-${doc._id.toString().slice(-4).toUpperCase()}`,
      name: doc.fullName,
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      phone: doc.phone || '',
      department: doc.department || 'General Medicine',
      qualification: doc.qualification || 'MBBS, MD',
      specialization: doc.specialization || doc.department || 'General Practice',
      experience: doc.experience || 5,
      status: doc.isActive ? 'Active' : 'Inactive',
      joiningDate: doc.createdAt.toISOString().split('T')[0],
      schedule: doc.schedule || 'Mon-Fri 09:00-17:00',
    }));

    res.json({
      success: true,
      data: mappedDoctors,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/doctors/:id
exports.getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await User.findOne({
      _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null,
      role: { $in: ['DOCTOR', 'doctor'] },
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const mapped = {
      id: doc._id,
      doctorId: doc.employeeId || `D-${doc._id.toString().slice(-4).toUpperCase()}`,
      name: doc.fullName,
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      phone: doc.phone || '',
      department: doc.department || 'General Medicine',
      qualification: doc.qualification || 'MBBS, MD',
      specialization: doc.specialization || doc.department || 'General Practice',
      experience: doc.experience || 5,
      status: doc.isActive ? 'Active' : 'Inactive',
      joiningDate: doc.createdAt.toISOString().split('T')[0],
      schedule: doc.schedule || 'Mon-Fri 09:00-17:00',
    };

    res.json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};

// POST /api/doctors
exports.createDoctor = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, department, qualification, specialization, experience, schedule, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const doc = await User.create({
      firstName,
      lastName,
      email,
      password: password || 'Welcome@2026',
      role: 'DOCTOR',
      department,
      phone,
      qualification,
      specialization,
      experience,
      schedule,
    });

    await logAuditEvent({
      user: req.user,
      action: 'Create',
      module: 'Doctors',
      description: `Created doctor account for ${doc.email}`,
    });

    const mapped = {
      id: doc._id,
      doctorId: doc.employeeId || `D-${doc._id.toString().slice(-4).toUpperCase()}`,
      name: doc.fullName,
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      phone: doc.phone || '',
      department: doc.department || 'General Medicine',
      qualification: doc.qualification || 'MBBS, MD',
      specialization: doc.specialization || doc.department || 'General Practice',
      experience: doc.experience || 5,
      status: 'Active',
      joiningDate: doc.createdAt.toISOString().split('T')[0],
      schedule: doc.schedule || 'Mon-Fri 09:00-17:00',
    };

    res.status(201).json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};

// PUT /api/doctors/:id
exports.updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, department, qualification, specialization, experience, schedule, status } = req.body;

    const doc = await User.findOneAndUpdate(
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null, role: { $in: ['DOCTOR', 'doctor'] } },
      {
        firstName,
        lastName,
        phone,
        department,
        qualification,
        specialization,
        experience,
        schedule,
        isActive: status === undefined ? undefined : status === 'Active',
      },
      { new: true, runValidators: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    await logAuditEvent({
      user: req.user,
      action: 'Update',
      module: 'Doctors',
      description: `Updated doctor account for ${doc.email}`,
    });

    const mapped = {
      id: doc._id,
      doctorId: doc.employeeId || `D-${doc._id.toString().slice(-4).toUpperCase()}`,
      name: doc.fullName,
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      phone: doc.phone || '',
      department: doc.department || 'General Medicine',
      qualification: doc.qualification || 'MBBS, MD',
      specialization: doc.specialization || doc.department || 'General Practice',
      experience: doc.experience || 5,
      status: doc.isActive ? 'Active' : 'Inactive',
      joiningDate: doc.createdAt.toISOString().split('T')[0],
      schedule: doc.schedule || 'Mon-Fri 09:00-17:00',
    };

    res.json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};
