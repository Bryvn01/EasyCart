const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Frontend error logging endpoint
 * Receives and logs errors from the frontend application
 */
router.post('/', asyncHandler(async (req, res) => {
  const {
    type,
    message,
    stack,
    timestamp,
    url,
    userAgent,
    componentName,
    endpoint,
    statusCode,
    ...additionalData
  } = req.body;

  // Log the frontend error
  logger.error(`Frontend Error: ${type}`, null, {
    type,
    message,
    stack,
    timestamp,
    url,
    userAgent,
    componentName,
    endpoint,
    statusCode,
    ...additionalData
  });

  // In production, you might want to aggregate these errors
  // and send them to a monitoring service like Sentry

  res.status(200).json({
    success: true,
    message: 'Error logged successfully'
  });
}));

/**
 * Get error statistics (admin only)
 * This would typically query a database of logged errors
 */
router.get('/stats', asyncHandler(async (req, res) => {
  // This is a placeholder - in a real app, you'd query error logs from a database
  res.json({
    success: true,
    data: {
      message: 'Error statistics endpoint - implement database integration',
      suggestion: 'Use a logging service like Sentry, LogRocket, or DataDog for production'
    }
  });
}));

module.exports = router;
