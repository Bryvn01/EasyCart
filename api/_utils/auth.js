// Authentication utility for Vercel serverless functions
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import models (using require to avoid circular dependencies)
function getUser() {
  return mongoose.model('User') || require('../../backend/models/User');
}

async function authenticateUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const User = getUser();
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new Error('Invalid token');
    }

    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

async function requireAdmin(req) {
  const user = await authenticateUser(req);
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return user;
}

module.exports = { authenticateUser, requireAdmin };
