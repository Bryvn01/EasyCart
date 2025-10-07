// Vercel Serverless Function: User Registration
// Endpoint: /api/auth/register

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { connectToDatabase } = require('../_utils/mongodb');
const { setCorsHeaders } = require('../_utils/cors');

// Import User model
const getUserModel = () => {
  try {
    return mongoose.model('User');
  } catch (error) {
    return require('../../backend/models/User');
  }
};

module.exports = async (req, res) => {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();
    const User = getUserModel();

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
    
    return res.status(201).json({
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
    console.error('Registration error:', error);
    return res.status(500).json({ message: error.message });
  }
};
