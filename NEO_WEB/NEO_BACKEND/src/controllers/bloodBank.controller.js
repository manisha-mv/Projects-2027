// src/controllers/bloodBank.controller.js
const { BloodInventory, BloodRequest } = require('../models/BloodBank');
const { logTraceabilityEvent, logAuditEvent } = require('../utils/eventLogger');

const today = () => new Date().toISOString().split('T')[0];

// ─── Inventory ─────────────────────────────────────────────────────────────────

exports.getInventory = async (req, res, next) => {
  try {
    const inventory = await BloodInventory.find().sort({ bloodGroup: 1 });
    res.json({ success: true, data: inventory });
  } catch (error) {
    next(error);
  }
};

exports.updateInventory = async (req, res, next) => {
  try {
    const { bloodGroup } = req.params;
    const { delta, notes } = req.body;
    const deltaNum = parseInt(delta, 10);

    const item = await BloodInventory.findOne({ bloodGroup });
    if (!item) return res.status(404).json({ success: false, message: 'Blood group not found in inventory' });

    item.units = Math.max(0, item.units + deltaNum);
    item.available = Math.max(0, item.available + deltaNum);
    item.lastUpdated = today();
    await item.save();

    await logAuditEvent({ user: req.user, action: 'Update', module: 'Blood Bank', description: `Blood inventory updated: ${bloodGroup} by ${delta} units. Notes: ${notes || 'N/A'}` });

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// ─── Requests ──────────────────────────────────────────────────────────────────

exports.getRequests = async (req, res, next) => {
  try {
    const { status = '' } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;

    const requests = await BloodRequest.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

exports.createRequest = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.requestId) {
      const count = await BloodRequest.countDocuments();
      data.requestId = `BR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }
    if (!data.requestedAt) data.requestedAt = today();

    const request = await BloodRequest.create(data);

    if (request.patientId) {
      await logTraceabilityEvent({
        patientId: request.patientId,
        patientName: request.patientName,
        type: 'PROCEDURE_COMPLETED',
        department: 'Blood Bank',
        performedBy: req.user ? req.user.fullName : 'Blood Bank',
        role: req.user ? req.user.role : 'LAB',
        status: 'Pending',
        description: `Blood request: ${request.units} unit(s) of ${request.bloodGroup} (${request.urgency})`,
        relatedId: request.requestId,
      });
    }

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

exports.issueBlood = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await BloodRequest.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { requestId: id }],
    });

    if (!request) return res.status(404).json({ success: false, message: 'Blood request not found' });

    // Deduct from inventory
    const inv = await BloodInventory.findOne({ bloodGroup: request.bloodGroup });
    if (!inv || inv.available < request.units) {
      return res.status(400).json({ success: false, message: `Insufficient ${request.bloodGroup} units in stock` });
    }

    inv.units = Math.max(0, inv.units - request.units);
    inv.available = Math.max(0, inv.available - request.units);
    inv.lastUpdated = today();
    await inv.save();

    request.status = 'Issued';
    request.issuedAt = today();
    request.issuedBy = req.user ? req.user.fullName : 'Blood Bank';
    await request.save();

    await logAuditEvent({ user: req.user, action: 'Issue', module: 'Blood Bank', patientId: request.patientId, patientName: request.patientName, description: `Issued ${request.units} unit(s) of ${request.bloodGroup} to ${request.patientName}` });

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};
