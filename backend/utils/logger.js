/**
 * Structured Logging Utility
 * Provides consistent logging format across the application
 * with different log levels and contextual information
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Create structured log entry
   */
  createLogEntry(level, message, context = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      environment: process.env.NODE_ENV || 'development',
      ...context
    };
  }

  /**
   * Format log for console output
   */
  formatLog(logEntry) {
    if (this.isProduction) {
      // JSON format for production (easier for log aggregation)
      return JSON.stringify(logEntry);
    } else {
      // Human-readable format for development
      const { timestamp, level, message, ...context } = logEntry;
      const contextStr = Object.keys(context).length > 0 
        ? `\n${JSON.stringify(context, null, 2)}` 
        : '';
      return `[${timestamp}] ${level}: ${message}${contextStr}`;
    }
  }

  /**
   * Error level logging
   */
  error(message, error = null, context = {}) {
    const logEntry = this.createLogEntry(LOG_LEVELS.ERROR, message, {
      ...context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    });
    console.error(this.formatLog(logEntry));
    
    // In production, you would send this to a logging service
    // e.g., Sentry, LogRocket, DataDog, etc.
    if (this.isProduction && global.errorTracker) {
      global.errorTracker.captureException(error || new Error(message), context);
    }
  }

  /**
   * Warning level logging
   */
  warn(message, context = {}) {
    const logEntry = this.createLogEntry(LOG_LEVELS.WARN, message, context);
    console.warn(this.formatLog(logEntry));
  }

  /**
   * Info level logging
   */
  info(message, context = {}) {
    const logEntry = this.createLogEntry(LOG_LEVELS.INFO, message, context);
    console.log(this.formatLog(logEntry));
  }

  /**
   * Debug level logging (only in development)
   */
  debug(message, context = {}) {
    if (!this.isProduction) {
      const logEntry = this.createLogEntry(LOG_LEVELS.DEBUG, message, context);
      console.log(this.formatLog(logEntry));
    }
  }

  /**
   * Log HTTP request
   */
  logRequest(req, context = {}) {
    this.info('HTTP Request', {
      method: req.method,
      url: req.url,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      ...context
    });
  }

  /**
   * Log HTTP response
   */
  logResponse(req, res, duration, context = {}) {
    const level = res.statusCode >= 500 ? LOG_LEVELS.ERROR :
                  res.statusCode >= 400 ? LOG_LEVELS.WARN :
                  LOG_LEVELS.INFO;
    
    const logEntry = this.createLogEntry(level, 'HTTP Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ...context
    });
    
    if (level === LOG_LEVELS.ERROR) {
      console.error(this.formatLog(logEntry));
    } else if (level === LOG_LEVELS.WARN) {
      console.warn(this.formatLog(logEntry));
    } else {
      console.log(this.formatLog(logEntry));
    }
  }

  /**
   * Log database operation
   */
  logDbOperation(operation, collection, duration, context = {}) {
    this.debug('Database Operation', {
      operation,
      collection,
      duration: `${duration}ms`,
      ...context
    });
  }

  /**
   * Log security event
   */
  logSecurityEvent(event, severity, context = {}) {
    const level = severity === 'high' ? LOG_LEVELS.ERROR : LOG_LEVELS.WARN;
    const logEntry = this.createLogEntry(level, `Security Event: ${event}`, {
      severity,
      ...context
    });
    
    if (level === LOG_LEVELS.ERROR) {
      console.error(this.formatLog(logEntry));
    } else {
      console.warn(this.formatLog(logEntry));
    }

    // Alert security monitoring service in production
    if (this.isProduction && severity === 'high' && global.errorTracker) {
      global.errorTracker.captureMessage(`Security Event: ${event}`, {
        level: 'error',
        extra: context
      });
    }
  }
}

// Export singleton instance
module.exports = new Logger();
