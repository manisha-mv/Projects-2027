import express from 'express';
import Attendance from '../models/Attendance.js';
import Child from '../models/Child.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// GET attendance for children
router.get('/', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'parent') {
      const escapedUsername = req.user.username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter = { parentUsername: { $regex: new RegExp('^' + escapedUsername + '$', 'i') } };
    }
    const children = await Child.find(filter, 'name nameTa attendanceHistory parentUsername');
    let allAttendance = [];
    children.forEach(c => {
      if (c.attendanceHistory) {
        c.attendanceHistory.forEach(a => {
          allAttendance.push({
            childId: c._id,
            name: c.name,
            nameTa: c.nameTa,
            date: a.date,
            status: a.status,
            nextVisitDate: a.nextVisitDate,
            _id: a._id
          });
        });
      }
    });
    res.json(allAttendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET attendance by date
router.get('/date/:date', authenticateToken, async (req, res) => {
  try {
    const date = req.params.date;
    const children = await Child.find({ 'attendanceHistory.date': date }, 'name nameTa attendanceHistory');
    let attendanceForDate = [];
    children.forEach(c => {
      const a = c.attendanceHistory.find(att => att.date === date);
      if (a) {
        attendanceForDate.push({
          childId: c._id,
          name: c.name,
          nameTa: c.nameTa,
          date: a.date,
          status: a.status,
          nextVisitDate: a.nextVisitDate,
          _id: a._id
        });
      }
    });
    res.json(attendanceForDate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT mark attendance
router.put('/:childId', authenticateToken, async (req, res) => {
  try {
    const { status, date, nextVisitDate } = req.body;
    const childId = req.params.childId;
    const recordDate = date || new Date().toISOString().split('T')[0];

    const child = await Child.findById(childId);
    if (!child) return res.status(404).json({ error: 'Child not found' });

    if (req.user.role === 'parent' && child.parentUsername.toLowerCase() !== req.user.username.toLowerCase()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!child.attendanceHistory) {
      child.attendanceHistory = [];
    }

    const existingIdx = child.attendanceHistory.findIndex(a => a.date === recordDate);
    if (existingIdx !== -1) {
      child.attendanceHistory[existingIdx].status = status;
      if (nextVisitDate !== undefined) child.attendanceHistory[existingIdx].nextVisitDate = nextVisitDate;
    } else {
      child.attendanceHistory.push({
        date: recordDate,
        status,
        nextVisitDate
      });
    }

    await child.save();

    // Return the updated record in the same format expected by the frontend
    const updatedRecord = child.attendanceHistory.find(a => a.date === recordDate);
    res.json({
      childId: child._id,
      name: child.name,
      nameTa: child.nameTa,
      date: updatedRecord.date,
      status: updatedRecord.status,
      nextVisitDate: updatedRecord.nextVisitDate,
      _id: updatedRecord._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

