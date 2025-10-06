const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const app = express();

// Import middleware
const { requestLogger, performanceMonitor } = require('./middleware/requestLogger');
const { errorHandler, notFoundHandler, setupGlobalErrorHandlers } = require('./middleware/errorHandler');
const { sanitizeInput, validateRequestSize } = require('./middleware/validation');
const { globalRateLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Setup global error handlers
setupGlobalErrorHandlers();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Request size limit (10MB)
app.use(validateRequestSize(10));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB injection protection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.logSecurityEvent('MongoDB Injection Attempt Blocked', 'high', {
      path: req.path,
      key
    });
  },
}));

// Input sanitization
app.use(sanitizeInput);

// CORS configuration
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:3001,https://easycart-1-752r.onrender.com").split(',');
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow all origins to avoid CORS issues
    logger.warn('CORS allowing origin', { origin });
    callback(null, true);
  },
  credentials: true
}));

// Request logging
app.use(requestLogger);

// Performance monitoring
app.use(performanceMonitor);

// Global rate limiting (excluding health checks)
app.use(globalRateLimiter);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/easycart')
  .then(() => {
    logger.info('MongoDB connected successfully');
  })
  .catch(err => {
    logger.error('MongoDB connection error', err);
  });

// Mongoose connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error', err);
});
mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
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
app.use('/api/errors', require('./routes/errors'));

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Initialize Socket.IO only if socket file exists
try {
  const { initSocket } = require('./socket');
  initSocket(server);
  logger.info('Socket.IO initialized successfully');
} catch (error) {
  logger.debug('Socket.IO not initialized', { message: error.message });
}

module.exports = app;