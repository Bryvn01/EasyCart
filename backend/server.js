const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:3001,https://easycart-1-752r.onrender.com,https://easycart-admin.onrender.com").split(',');
console.log('CORS Configuration:', { 
  allowedOrigins, 
  env: process.env.FRONTEND_URL || '(using defaults)',
  timestamp: new Date().toISOString()
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      console.log(`CORS: Allowed origin: ${origin}`);
      return callback(null, true);
    }
    
    // In development, allow all origins to avoid CORS issues
    console.warn(`CORS: Allowing unlisted origin: ${origin}`);
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/easycart')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Mongoose connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose is connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Root route for API information
app.get('/', (req, res) => {
  res.json({
    message: 'EasyCart API',
    status: 'OK',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      upload: '/api/upload',
      seed: '/api/seed'
    },
    documentation: 'https://github.com/Bryvn01/EasyCart'
  });
});

// Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/seed', require('./routes/seed'));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.IO only if socket file exists
try {
  const { initSocket } = require('./socket');
  initSocket(server);
} catch (error) {
  console.log('Socket.IO not initialized:', error.message);
}

module.exports = app;