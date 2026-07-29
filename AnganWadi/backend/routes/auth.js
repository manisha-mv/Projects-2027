import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, name: user.name, nameTa: user.nameTa },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role, name: user.name, nameTa: user.nameTa }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, role, name, nameTa } = req.body;
    const user = new User({ username, password, role, name, nameTa });
    await user.save();
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already exists. Please choose a different one.' });
    }
    res.status(400).json({ error: err.message });
  }
});

export default router;

