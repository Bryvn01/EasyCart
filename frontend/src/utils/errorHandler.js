import toast from 'react-hot-toast';

/**
 * Display user-friendly error messages
 */
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  let message = defaultMessage;
  
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    if (status === 401) {
      message = 'Please login to continue';
    } else if (status === 403) {
      message = 'You do not have permission to perform this action';
    } else if (status === 404) {
      message = 'The requested resource was not found';
    } else if (status === 422 || status === 400) {
      // Validation errors
      if (data.message) {
        message = data.message;
      } else if (data.error) {
        message = data.error;
      } else if (data.errors) {
        // Handle multiple field errors
        const errors = Object.values(data.errors).flat();
        message = errors[0] || defaultMessage;
      }
    } else if (status >= 500) {
      message = 'Server error. Please try again later.';
    } else if (data.message) {
      message = data.message;
    } else if (data.error) {
      message = data.error;
    }
  } else if (error.request) {
    // Request made but no response
    message = 'Network error. Please check your connection.';
  } else if (error.message) {
    // Something else happened
    message = error.message;
  }
  
  toast.error(message);
  return message;
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
