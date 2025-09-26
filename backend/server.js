const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost and onrender.com domains
    if (origin.includes('localhost') || origin.includes('.onrender.com')) {
      return callback(null, true);
    }
    
    callback(null, true); // Allow all for now
  },
  credentials: true
}));
app.use(express.json());

// MongoDB Connection with fallback
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/easycart';
console.log('Attempting MongoDB connection to:', mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB');

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  connectTimeoutMS: 5000,
})
  .then(() => {
    console.log('MongoDB connected successfully');
    global.dbConnected = true;
  })
  .catch(err => {
    console.log('MongoDB connection failed, using fallback mode:', err.message);
    global.dbConnected = false;
  });

// Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/seed', require('./routes/seed'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EasyCart API is running', timestamp: new Date().toISOString() });
});

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