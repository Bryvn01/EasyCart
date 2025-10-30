import toast from 'react-hot-toast';

// Log environment configuration on module load
if (process.env.NODE_ENV === 'development') {
  console.log('Environment check:', {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || '(not set)',
    NODE_ENV: process.env.NODE_ENV
  });
}

/**
 * Enhanced error type detection
 */
export const detectErrorType = (error) => {
  if (!error) return 'UNKNOWN';
  
  // CORS errors typically have no response and specific message patterns
  if (error.request && !error.response) {
    const errorMsg = error.message?.toLowerCase() || '';
    if (errorMsg.includes('cors') || errorMsg.includes('cross-origin')) {
      return 'CORS';
    }
    if (errorMsg.includes('network') || errorMsg.includes('failed to fetch')) {
      return 'NETWORK';
    }
    return 'NO_RESPONSE';
  }
  
  // Server responded with error
  if (error.response) {
    const { status } = error.response;
    if (status >= 500) return 'SERVER';
    if (status === 404) return 'NOT_FOUND';
    if (status === 403) return 'FORBIDDEN';
    if (status === 401) return 'UNAUTHORIZED';
    if (status === 400 || status === 422) return 'VALIDATION';
    return 'CLIENT';
  }
  
  return 'UNKNOWN';
};

/**
 * Get detailed error message based on error type and context
 */
export const getDetailedErrorMessage = (error, context = '') => {
  const errorType = detectErrorType(error);
  const contextPrefix = context ? `${context}: ` : '';
  
  switch (errorType) {
    case 'CORS':
      return {
        type: 'CORS',
        message: `${contextPrefix}CORS policy error. The backend server may not be configured to accept requests from this domain.`,
        userMessage: 'Unable to connect to server. This might be a configuration issue. Please contact support.',
        technical: 'Check backend CORS settings and ensure frontend URL is whitelisted.',
        canRetry: false
      };
      
    case 'NETWORK':
      return {
        type: 'NETWORK',
        message: `${contextPrefix}Network connection failed. Unable to reach the server.`,
        userMessage: 'Network error. Please check your internet connection and try again.',
        technical: 'Check if backend server is running and accessible.',
        canRetry: true
      };
      
    case 'NO_RESPONSE':
      return {
        type: 'NO_RESPONSE',
        message: `${contextPrefix}Server did not respond. The backend may be down or unreachable.`,
        userMessage: 'Server is not responding. It may be temporarily unavailable. Please try again in a moment.',
        technical: 'Verify backend service status and network connectivity.',
        canRetry: true
      };
      
    case 'SERVER':
      return {
        type: 'SERVER',
        message: `${contextPrefix}Server error (${error.response?.status}). Something went wrong on the server.`,
        userMessage: 'Server error. Our team has been notified. Please try again later.',
        technical: `HTTP ${error.response?.status}: ${error.response?.data?.message || 'Internal server error'}`,
        canRetry: true
      };
      
    case 'NOT_FOUND':
      return {
        type: 'NOT_FOUND',
        message: `${contextPrefix}Resource not found (404).`,
        userMessage: 'The requested resource was not found.',
        technical: 'Check API endpoint URLs and ensure backend routes are configured correctly.',
        canRetry: false
      };
      
    case 'FORBIDDEN':
      return {
        type: 'FORBIDDEN',
        message: `${contextPrefix}Access forbidden (403).`,
        userMessage: 'You do not have permission to perform this action.',
        technical: 'Check authentication and authorization settings.',
        canRetry: false
      };
      
    case 'UNAUTHORIZED':
      return {
        type: 'UNAUTHORIZED',
        message: `${contextPrefix}Unauthorized (401).`,
        userMessage: 'Please login to continue.',
        technical: 'Authentication required or token expired.',
        canRetry: false
      };
      
    case 'VALIDATION':
      const validationMsg = error.response?.data?.message || 
                           error.response?.data?.error || 
                           'Validation error';
      return {
        type: 'VALIDATION',
        message: `${contextPrefix}${validationMsg}`,
        userMessage: validationMsg,
        technical: JSON.stringify(error.response?.data?.errors || {}),
        canRetry: false
      };
      
    default:
      return {
        type: 'UNKNOWN',
        message: `${contextPrefix}${error.message || 'An unexpected error occurred'}`,
        userMessage: 'An unexpected error occurred. Please try again.',
        technical: error.toString(),
        canRetry: true
      };
  }
};

/**
 * Display user-friendly error messages with enhanced diagnostics
 */
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  const errorDetails = getDetailedErrorMessage(error, '');
  const message = errorDetails.userMessage || defaultMessage;
  
  // Log technical details for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error Details:', {
      type: errorDetails.type,
      message: errorDetails.message,
      technical: errorDetails.technical,
      canRetry: errorDetails.canRetry,
      originalError: error
    });
  }
  
  toast.error(message, {
    duration: errorDetails.canRetry ? 5000 : 6000,
    icon: errorDetails.type === 'NETWORK' ? '📡' : 
          errorDetails.type === 'CORS' ? '🚫' : 
          errorDetails.type === 'SERVER' ? '🔧' : '❌'
  });
  
  return {
    message,
    ...errorDetails
  };
};

/**
 * Display success messages
 */
export const handleApiSuccess = (message, options = {}) => {
  toast.success(message, options);
};

/**
 * Display loading toast
 */
export const handleApiLoading = (message = 'Loading...') => {
  return toast.loading(message);
};

/**
 * Dismiss a toast
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Show confirmation toast with custom options
 */
export const showConfirmation = (message, options = {}) => {
  return toast(message, {
    icon: '❓',
    duration: 5000,
    ...options,
  });
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} initialDelay - Initial delay in ms (doubles each retry)
 * @param {Function} shouldRetry - Optional function to determine if error is retryable
 * @returns {Promise} - Result of the function or throws last error
 */
export const retryWithBackoff = async (
  fn,
  maxRetries = 3,
  initialDelay = 1000,
  shouldRetry = null
) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Determine if error is retryable
      const errorDetails = getDetailedErrorMessage(error);
      const isRetryable = shouldRetry ? shouldRetry(error) : errorDetails.canRetry;
      
      if (!isRetryable) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Check API health before making requests
 * @param {string} baseUrl - Base URL of the API
 * @returns {Promise<boolean>} - True if API is healthy
 */
export const checkApiHealth = async (baseUrl) => {
  try {
    // Skip health check if baseUrl is not properly configured
    if (!baseUrl || baseUrl === 'undefined' || baseUrl.includes('undefined')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('API base URL is not configured properly:', baseUrl);
      }
      return false;
    }
    
    const healthEndpoints = [
      `${baseUrl}/health/`,
      `${baseUrl}/health`,
      baseUrl
    ];
    
    for (const endpoint of healthEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok || response.status === 404) {
          // 404 means server is reachable even if health endpoint doesn't exist
          return true;
        }
      } catch (e) {
        // Try next endpoint
        continue;
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
};
