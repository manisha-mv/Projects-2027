import express from 'express';
import Child from '../models/Child.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// GET all children (admin only)
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const children = await Child.find();
    res.json(children);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new child (admin)
router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const child = new Child(req.body);
    await child.save();
    res.status(201).json(child);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update child
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) return res.status(404).json({ error: 'Child not found' });

    // Parents can only update own child (simple check via parentUsername)
    if (req.user.role === 'parent' && child.parentUsername.toLowerCase() !== req.user.username.toLowerCase()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    child.set(req.body);
    await child.save();
    res.json(child);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE child (admin)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    await Child.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single child for parent dashboard
router.get('/parent/:username', authenticateToken, async (req, res) => {
  try {
    const escapedUsername = req.params.username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const child = await Child.findOne({ 
      parentUsername: { $regex: new RegExp('^' + escapedUsername + '$', 'i') } 
    });
    if (!child) return res.status(404).json({ error: 'No child found' });
    res.json(child);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single child for parent dashboard (legacy)
router.get('/my-child', authenticateToken, async (req, res) => {
  try {
    const escapedUsername = req.user.username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const child = await Child.findOne({ 
      parentUsername: { $regex: new RegExp('^' + escapedUsername + '$', 'i') } 
    });
    if (!child) return res.status(404).json({ error: 'No child found' });
    res.json(child);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single child by id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) return res.status(404).json({ error: 'Child not found' });
    
    if (req.user.role === 'parent' && child.parentUsername.toLowerCase() !== req.user.username.toLowerCase()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(child);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

