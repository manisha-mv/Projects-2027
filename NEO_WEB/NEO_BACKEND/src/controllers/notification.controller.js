// src/controllers/notification.controller.js
const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const { role = '', page = 1, limit = 30 } = req.query;
    const query = {};
    if (role) query.forRoles = { $in: [role, 'ALL'] };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const unread = await Notification.countDocuments({ ...query, read: false });

    res.json({ success: true, data: notifications, unread, pagination: { total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) } });
  } catch (error) { next(error); }
};

exports.markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { notificationId: id }] },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: notification });
  } catch (error) { next(error); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    const { role } = req.body;
    const query = { read: false };
    if (role) query.forRoles = { $in: [role, 'ALL'] };

    await Notification.updateMany(query, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) { next(error); }
};

exports.createNotification = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.notificationId) {
      const count = await Notification.countDocuments();
      data.notificationId = `NOTIF-${Date.now()}-${count + 1}`;
    }
    const notification = await Notification.create(data);
    res.status(201).json({ success: true, data: notification });
  } catch (error) { next(error); }
};
