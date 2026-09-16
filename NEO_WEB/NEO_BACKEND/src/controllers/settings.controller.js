// src/controllers/settings.controller.js
const Settings = require('../models/Settings');

exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ key: 'hospital_profile' });
    if (!settings) {
      settings = await Settings.create({ key: 'hospital_profile' });
    }
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const allowed = ['hospitalName', 'tagline', 'contactEmail', 'contactPhone', 'address', 'currency', 'timezone'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const settings = await Settings.findOneAndUpdate(
      { key: 'hospital_profile' },
      updates,
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};
