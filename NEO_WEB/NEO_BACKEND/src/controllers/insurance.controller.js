// src/controllers/insurance.controller.js
const { InsuranceClaim, InsurancePolicy } = require('../models/Insurance');
const { logTraceabilityEvent, logAuditEvent } = require('../utils/eventLogger');

// ─── Claims ────────────────────────────────────────────────────────────────────

exports.getClaims = async (req, res, next) => {
  try {
    const { search = '', status = '', provider = '', page = 1, limit = 20 } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { claimId: { $regex: search, $options: 'i' } },
        { policyNo: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'All') query.status = status;
    if (provider && provider !== 'All') query.provider = provider;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await InsuranceClaim.countDocuments(query);
    const claims = await InsuranceClaim.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));

    res.json({ success: true, data: claims, pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) } });
  } catch (error) {
    next(error);
  }
};

exports.createClaim = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.claimId) {
      const count = await InsuranceClaim.countDocuments();
      data.claimId = `CLM-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    }
    if (!data.submittedDate) data.submittedDate = new Date().toISOString().split('T')[0];

    const claim = await InsuranceClaim.create(data);

    await logAuditEvent({ user: req.user, action: 'Create', module: 'Insurance', patientId: claim.patientId, patientName: claim.patientName, description: `Insurance claim ${claim.claimId} submitted to ${claim.provider}` });

    res.status(201).json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
};

exports.updateClaim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const claim = await InsuranceClaim.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { claimId: id }] },
      updates,
      { new: true }
    );

    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

    await logAuditEvent({ user: req.user, action: 'Update', module: 'Insurance', patientId: claim.patientId, patientName: claim.patientName, description: `Claim ${claim.claimId} status updated to ${claim.status}` });

    res.json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
};

// ─── Policies ──────────────────────────────────────────────────────────────────

exports.getPolicies = async (req, res, next) => {
  try {
    const { patientId = '' } = req.query;
    const query = {};
    if (patientId) query.patientId = patientId;

    const policies = await InsurancePolicy.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: policies });
  } catch (error) {
    next(error);
  }
};

exports.createPolicy = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.policyId) {
      const count = await InsurancePolicy.countDocuments();
      data.policyId = `POL-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    }

    const policy = await InsurancePolicy.create(data);
    res.status(201).json({ success: true, data: policy });
  } catch (error) {
    next(error);
  }
};
