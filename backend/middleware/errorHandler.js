/**
 * Centralized Error Handling Middleware
 * Provides consistent error responses and logging
 */

const logger = require('../utils/logger');

/**
 * Custom Application Error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error Types
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map(e => e.message);
    error = new ValidationError('Validation failed', messages);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error = new ValidationError(`Invalid ${err.path}: ${err.value}`);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = new ConflictError(`${field} already exists`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expired');
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  const isOperational = error.isOperational !== undefined ? error.isOperational : false;

  // Log error
  if (statusCode >= 500) {
    logger.error('Server Error', err, {
      path: req.path,
      method: req.method,
      statusCode,
      userId: req.user?.id
    });
  } else if (statusCode >= 400) {
    logger.warn('Client Error', {
      path: req.path,
      method: req.method,
      statusCode,
      message,
      userId: req.user?.id
    });
  }

  // Send error response
  const errorResponse = {
    success: false,
    error: {
      message,
      statusCode,
      timestamp: error.timestamp || new Date().toISOString()
    }
  };

  // Add additional error details in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error.stack = err.stack;
    if (error.errors) {
      errorResponse.error.details = error.errors;
    }
  } else {
    // In production, don't expose internal error details for non-operational errors
    if (!isOperational) {
      errorResponse.error.message = 'An unexpected error occurred';
    }
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

/**
 * Async Handler Wrapper
 * Catches async errors and passes them to error handler
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global unhandled rejection handler
 */
const setupGlobalErrorHandlers = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', reason, {
      type: 'unhandledRejection',
      promise: promise
    });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error, {
      type: 'uncaughtException'
    });
    
    // Exit process after logging
    // In production, use a process manager like PM2 to restart
    process.exit(1);
  });
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  setupGlobalErrorHandlers
};
