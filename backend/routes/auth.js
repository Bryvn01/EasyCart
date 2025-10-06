const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { authRateLimiter, registrationRateLimiter } = require('../middleware/rateLimiter');
const { validateInput } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Validation schemas
const registerSchema = {
  email: {
    required: true,
    type: 'string',
    schema: 'email',
    maxLength: 255
  },
  username: {
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/
  },
  password: {
    required: true,
    type: 'string',
    minLength: 6,
    maxLength: 100
  },
  password_confirm: {
    required: true,
    type: 'string'
  }
};

const loginSchema = {
  email: {
    required: true,
    type: 'string'
  },
  password: {
    required: true,
    type: 'string'
  }
};

// Register
router.post('/register', 
  registrationRateLimiter,
  validateInput(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, username, phone, address, password_confirm } = req.body;
    
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
  })
);

// Login
router.post('/login',
  authRateLimiter,
  validateInput(loginSchema),
  asyncHandler(async (req, res) => {
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
  })
);

// Get profile
router.get('/profile', auth, asyncHandler(async (req, res) => {
  res.json({
    user: { 
      id: req.user._id, 
      email: req.user.email, 
      name: req.user.name, 
      role: req.user.role 
    }
  });
}));

module.exports = router;