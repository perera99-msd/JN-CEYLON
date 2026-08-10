const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes here require Admin rights
router.use(protect, adminOnly);

// GET /api/users - List all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const { username, fullName, password, role } = req.body;

    if (!username || !fullName || !password) {
      return res.status(400).json({ message: 'Username, Full Name, and Password are required' });
    }

    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const newUser = new User({
      username: username.trim(),
      fullName: fullName.trim(),
      password,
      role: role === 'ADMIN' ? 'ADMIN' : 'NORMAL'
    });

    await newUser.save();

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/users/:id - Update user details or change password
router.put('/:id', async (req, res) => {
  try {
    const { fullName, role, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName) user.fullName = fullName.trim();
    if (role && (role === 'ADMIN' || role === 'NORMAL')) {
      user.role = role;
    }

    if (password && password.trim() !== '') {
      user.password = password; // pre-save hook will hash it
    }

    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      role: user.role
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/users/:id - Delete user (Cannot delete self)
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account!' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
