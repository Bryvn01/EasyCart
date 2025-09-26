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
      username: req.user.username,
      phone: req.user.phone,
      address: req.user.address,
      role: req.user.role 
    }
  });
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, phone, address } = req.body;
    
    // Check if email or username is being changed and already exists
    if (email && email !== req.user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }
    
    if (username && username !== req.user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    // Update user profile
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (username && !updateData.name) updateData.name = username;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      updateData, 
      { new: true, runValidators: true }
    );

    res.json({
      user: { 
        id: updatedUser._id, 
        email: updatedUser.email, 
        name: updatedUser.name, 
        username: updatedUser.username,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role 
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;