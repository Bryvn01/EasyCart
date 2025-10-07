// Vercel Serverless Function: User Login
// Endpoint: /api/auth/login

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

    const { email, password } = req.body;
    
    const user = await User.findOne({ $or: [{ email }, { username: email }] });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const access = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret');
    const refresh = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
    
    return res.json({
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
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message });
  }
};
