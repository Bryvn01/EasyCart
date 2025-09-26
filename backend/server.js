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

// MongoDB Connection with improved error handling and DNS resolution
const connectToMongoDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/easycart';
  
  const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
    maxPoolSize: 10,
    minPoolSize: 5,
  };

  // Add additional options for mongodb+srv connections to handle DNS issues
  if (mongoUri.startsWith('mongodb+srv://')) {
    mongoOptions.family = 4; // Force IPv4 for better DNS resolution
    mongoOptions.retryWrites = true;
    mongoOptions.w = 'majority';
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('URI format:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Log URI without credentials
    
    await mongoose.connect(mongoUri, mongoOptions);
    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ Initial MongoDB connection failed:', error.message);
    
    // If SRV lookup fails, provide helpful error message and try fallback
    if (error.message.includes('querySrv ENOTFOUND') || error.message.includes('ENOTFOUND')) {
      console.error('🔍 DNS Resolution Error - This usually indicates:');
      console.error('1. Incorrect MongoDB Atlas connection string');
      console.error('2. Network/DNS issues in the deployment environment');
      console.error('3. MongoDB Atlas cluster not accessible');
      console.error('💡 Check your MONGODB_URI environment variable format');
      
      // Try fallback connection if available
      const fallbackUri = process.env.MONGODB_FALLBACK_URI;
      if (fallbackUri && fallbackUri !== mongoUri) {
        console.log('🔄 Attempting fallback connection...');
        try {
          await mongoose.connect(fallbackUri, mongoOptions);
          console.log('✅ Fallback MongoDB connection successful');
          return;
        } catch (fallbackError) {
          console.error('❌ Fallback connection also failed:', fallbackError.message);
        }
      }
    }
    
    // In production, we might want to retry or use a fallback
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Retrying connection in 5 seconds...');
      setTimeout(() => {
        connectToMongoDB();
      }, 5000);
    } else {
      // In development, exit to allow restart
      process.exit(1);
    }
  }
};

// Initialize MongoDB connection
connectToMongoDB();

// Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/seed', require('./routes/seed'));

// Health check with MongoDB status
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const mongoStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  const healthCheck = {
    status: 'OK',
    message: 'EasyCart API is running',
    timestamp: new Date().toISOString(),
    mongodb: {
      status: mongoStates[mongoStatus] || 'unknown',
      readyState: mongoStatus
    },
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version || '1.0.0'
  };
  
  // Return 503 if MongoDB is not connected in production
  if (process.env.NODE_ENV === 'production' && mongoStatus !== 1) {
    return res.status(503).json({
      ...healthCheck,
      status: 'ERROR',
      message: 'Service unavailable - Database not connected'
    });
  }
  
  res.json(healthCheck);
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