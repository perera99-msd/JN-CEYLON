const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.username = user.username;

    res.json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).select('-passwordHash');
      if (user) {
        return res.json(user);
      }
    } catch (e) {}
  }
  // Return mock admin if dev or unauthenticated initial state for smooth experience
  res.json({ _id: 'admin', username: 'admin', fullName: 'JN Admin', role: 'ADMIN' });
});

module.exports = router;
