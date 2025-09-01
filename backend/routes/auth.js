const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, phone, address, password_confirm } = req.body;
    
    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Email, password, and username are required' });
    }
    
    if (password !== password_confirm) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Username already exists' 
      });
    }

    const user = new User({ 
      email, 
      password, 
      name: username,
      username,
      phone,
      address
    });
    await user.save();

    const access = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret');
    const refresh = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
    
    res.status(201).json({
      access,
      refresh,
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        username: user.username,
        role: user.role,
        is_admin: user.role === 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ $or: [{ email }, { username: email }] });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const access = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret');
    const refresh = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
    
    res.json({
      access,
      refresh,
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        username: user.username,
        role: user.role,
        is_admin: user.role === 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  res.json({
    user: { 
      id: req.user._id, 
      email: req.user.email, 
      name: req.user.name, 
      role: req.user.role 
    }
  });
});

module.exports = router;