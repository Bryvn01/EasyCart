/**
 * Frontend Error Logger Service
 * Provides centralized error tracking and logging for the frontend
 */

const API_URL = process.env.REACT_APP_API_URL;
const isProduction = process.env.NODE_ENV === 'production';

class ErrorLogger {
  constructor() {
    this.setupGlobalErrorHandlers();
  }

  /**
   * Setup global error handlers
   */
  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'unhandledRejection',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        promise: event.promise
      });
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'globalError',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });
  }

  /**
   * Log error to console and tracking service
   */
  logError(errorData) {
    const errorLog = {
      ...errorData,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    };

    // Log to console in development
    if (!isProduction) {
      console.error('Error logged:', errorLog);
    }

    // Send to backend in production
    if (isProduction && API_URL) {
      this.sendToBackend(errorLog);
    }
  }

  /**
   * Log API errors
   */
  logApiError(endpoint, error, statusCode) {
    this.logError({
      type: 'apiError',
      endpoint,
      message: error?.message || 'API Error',
      statusCode,
      error
    });
  }

  /**
   * Log navigation errors
   */
  logNavigationError(path, error) {
    this.logError({
      type: 'navigationError',
      path,
      message: error?.message || 'Navigation Error',
      error
    });
  }

  /**
   * Log component errors
   */
  logComponentError(componentName, error, errorInfo) {
    this.logError({
      type: 'componentError',
      componentName,
      message: error?.message || 'Component Error',
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      error
    });
  }

  /**
   * Log user action errors
   */
  logUserActionError(action, error) {
    this.logError({
      type: 'userActionError',
      action,
      message: error?.message || 'User Action Error',
      error
    });
  }

  /**
   * Send error to backend
   */
  async sendToBackend(errorLog) {
    try {
      await fetch(`${API_URL}/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog)
      });
    } catch (err) {
      // Silently fail if error logging fails
      console.error('Failed to send error log:', err);
    }
  }

  /**
   * Log warning (non-critical issues)
   */
  logWarning(message, context = {}) {
    const warningLog = {
      type: 'warning',
      message,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    if (!isProduction) {
      console.warn('Warning logged:', warningLog);
    }
  }

  /**
   * Log info (informational messages)
   */
  logInfo(message, context = {}) {
    if (!isProduction) {
      console.log('Info:', message, context);
    }
  }

  /**
   * Track performance issues
   */
  logPerformanceIssue(metric, value, threshold) {
    if (value > threshold) {
      this.logWarning(`Performance issue: ${metric}`, {
        metric,
        value,
        threshold,
        exceeded: value - threshold
      });
    }
  }
}

// Export singleton instance
const errorLogger = new ErrorLogger();

export default errorLogger;

// Export helper functions
export const logError = (error, context) => errorLogger.logError({ ...error, ...context });
export const logApiError = (endpoint, error, statusCode) => errorLogger.logApiError(endpoint, error, statusCode);
export const logComponentError = (componentName, error, errorInfo) => errorLogger.logComponentError(componentName, error, errorInfo);
export const logWarning = (message, context) => errorLogger.logWarning(message, context);
export const logInfo = (message, context) => errorLogger.logInfo(message, context);
