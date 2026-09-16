// src/controllers/traceability.controller.js
const TreatmentTraceability = require('../models/TreatmentTraceability');

exports.getPatientTrace = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await TreatmentTraceability.countDocuments({ patientId });
    const events = await TreatmentTraceability.find({ patientId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({ success: true, data: events, pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) } });
  } catch (error) { next(error); }
};

exports.getAllTrace = async (req, res, next) => {
  try {
    const { search = '', type = '', department = '', page = 1, limit = 30 } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { performedBy: { $regex: search, $options: 'i' } },
      ];
    }
    if (type && type !== 'All') query.type = type;
    if (department && department !== 'All') query.department = department;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await TreatmentTraceability.countDocuments(query);
    const events = await TreatmentTraceability.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({ success: true, data: events, pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) } });
  } catch (error) { next(error); }
};
