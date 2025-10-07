// MongoDB connection utility for Vercel serverless functions
const mongoose = require('mongoose');

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/easycart';
  console.log('Creating new MongoDB connection');

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    cachedConnection = connection;
    console.log('✅ MongoDB connected successfully to:', mongoose.connection.name);
    return connection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
}

module.exports = { connectToDatabase };
