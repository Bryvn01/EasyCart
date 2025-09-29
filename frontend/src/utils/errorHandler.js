import toast from 'react-hot-toast';
import { analytics } from '../services/analytics';

export class ErrorHandler {
  static logError(error, context = {}) {
    console.error('Error logged:', error, context);
    
    // Track error in analytics
    analytics.track('Error Occurred', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.pathname
    });
  }

  static handleApiError(error, context = {}) {
    this.logError(error, { ...context, type: 'API_ERROR' });
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      switch (status) {
        case 400:
          toast.error(message || 'Invalid request. Please check your input.');
          break;
        case 401:
          toast.error('Authentication required. Please log in.');
          // Redirect to login if needed
          if (window.location.pathname !== '/login') {
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
          break;
        case 403:
          toast.error('Access denied. You don\'t have permission for this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Our team has been notified.');
          break;
        default:
          toast.error(message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }
  }

  static handleFormError(error, formName) {
    this.logError(error, { type: 'FORM_ERROR', formName });
    
    if (error.response?.data?.errors) {
      // Handle validation errors
      const errors = error.response.data.errors;
      Object.keys(errors).forEach(field => {
        toast.error(`${field}: ${errors[field][0]}`);
      });
    } else {
      this.handleApiError(error, { formName });
    }
  }

  static handleAsyncError(asyncFn, context = {}) {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        this.handleApiError(error, context);
        throw error;
      }
    };
  }

  static createRetryHandler(maxRetries = 3, delay = 1000) {
    return async (fn, context = {}) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error) {
          if (attempt === maxRetries) {
            this.handleApiError(error, { ...context, finalAttempt: true });
            throw error;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
          
          this.logError(error, { 
            ...context, 
            attempt, 
            willRetry: true 
          });
        }
      }
    };
  }
}

// Helper function for async/await error handling
export const safeAsync = (fn, errorHandler = ErrorHandler.handleApiError) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler(error);
      return null;
    }
  };
};

// Hook for error handling in components
export const useErrorHandler = () => {
  const handleError = (error, context) => {
    ErrorHandler.handleApiError(error, context);
  };

  const handleFormError = (error, formName) => {
    ErrorHandler.handleFormError(error, formName);
  };

  const createAsyncHandler = (context) => {
    return ErrorHandler.handleAsyncError(async (fn) => fn(), context);
  };

  return {
    handleError,
    handleFormError,
    createAsyncHandler
  };
};