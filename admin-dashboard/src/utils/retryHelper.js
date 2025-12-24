/**
 * API Retry Utility
 * Implements exponential backoff retry logic for failed API calls
 */

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} delay - Initial delay in milliseconds
 * @param {number} backoffFactor - Multiplier for delay on each retry
 * @param {Function} shouldRetry - Optional function to determine if error should trigger retry
 * @returns {Promise} - Result of the function or throws error after all retries exhausted
 */
export const retryWithBackoff = async (
  fn,
  maxRetries = 3,
  delay = 1000,
  backoffFactor = 2,
  shouldRetry = (error) => {
    // Retry on network errors or 5xx server errors, but not on 4xx client errors
    if (!error.response) return true; // Network error
    const status = error.response.status;
    return status >= 500 && status < 600; // Server errors
  }
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted attempts or if error shouldn't be retried
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const waitTime = delay * Math.pow(backoffFactor, attempt);

      console.warn(
        `API call failed (attempt ${attempt + 1}/${maxRetries + 1}). ` +
        `Retrying in ${waitTime}ms...`,
        error.message
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
};

/**
 * Create a retry wrapper for an API client
 * @param {Object} apiClient - Axios instance or similar API client
 * @param {Object} options - Retry options
 * @returns {Object} - Wrapped API client with retry logic
 */
export const createRetryableApi = (apiClient, options = {}) => {
  const {
    maxRetries = 3,
    delay = 1000,
    backoffFactor = 2,
    shouldRetry
  } = options;

  return {
    get: (url, config) => retryWithBackoff(
      () => apiClient.get(url, config),
      maxRetries,
      delay,
      backoffFactor,
      shouldRetry
    ),
    post: (url, data, config) => retryWithBackoff(
      () => apiClient.post(url, data, config),
      maxRetries,
      delay,
      backoffFactor,
      shouldRetry
    ),
    put: (url, data, config) => retryWithBackoff(
      () => apiClient.put(url, data, config),
      maxRetries,
      delay,
      backoffFactor,
      shouldRetry
    ),
    patch: (url, data, config) => retryWithBackoff(
      () => apiClient.patch(url, data, config),
      maxRetries,
      delay,
      backoffFactor,
      shouldRetry
    ),
    delete: (url, config) => retryWithBackoff(
      () => apiClient.delete(url, config),
      maxRetries,
      delay,
      backoffFactor,
      shouldRetry
    ),
  };
};

export default retryWithBackoff;
