/**
 * API Client Configuration
 * Axios instance with JWT authentication, token refresh, and error handling
 *
 * BEST PRACTICES:
 * - Automatic JWT token injection
 * - Token refresh on 401
 * - Request/response interceptors
 * - Centralized error handling
 * - Retry logic for failed requests
 * - Network status awareness
 */

import axios, {
  AxiosInstance,
  AxiosError,

  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import NetInfo from '@react-native-community/netinfo';
import {Platform} from 'react-native';
import {getToken, setToken, removeToken, getRefreshToken} from '@/utils/storage';

// API Base URL
// Note: Using computer's local IP (192.168.1.67) for physical device testing
const API_BASE_URL = __DEV__
  ? Platform.select({
      android: 'http://192.168.1.67:8000/api',
      default: 'http://localhost:8000/api',
    })!
  : 'http://localhost:8000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Track if token refresh is in progress
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Request Interceptor
 * - Inject JWT token
 * - Check network connectivity
 * - Add request timestamp for monitoring
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return Promise.reject(new Error('No internet connection'));
    }

    // Inject access token
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp for request monitoring
    config.metadata = {startTime: Date.now()};

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handle successful responses
 * - Automatic token refresh on 401
 * - Centralized error handling
 * - Response time logging
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time in development
    if (__DEV__ && response.config.metadata?.startTime) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(
        `[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`
      );
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Log error in development
    if (__DEV__) {
      console.error('[API Error]', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: error.response?.status,
        message: error.message,
      });
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Request new access token
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const {access} = response.data;
        await setToken(access);

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        // Process queued requests
        processQueue(null, access);

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        processQueue(refreshError as Error, null);
        await removeToken();

        // Trigger logout event (handled by auth store)
        // You can emit a custom event here or use a callback

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle network errors
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      return Promise.reject(
        new Error('Network error. Please check your internet connection.')
      );
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }

    // Return original error
    return Promise.reject(error);
  }
);

/**
 * Generic API error handler
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error status
      const {status, data} = error.response;

      if (status === 400) {
        return data.message || data.error || 'Invalid request';
      }
      if (status === 401) {
        return 'Authentication required. Please log in.';
      }
      if (status === 403) {
        return 'You do not have permission to perform this action.';
      }
      if (status === 404) {
        return 'Resource not found.';
      }
      if (status === 429) {
        return 'Too many requests. Please try again later.';
      }
      if (status >= 500) {
        return 'Server error. Please try again later.';
      }

      return data.message || data.error || 'An error occurred';
    } else if (error.request) {
      // Request made but no response
      return 'No response from server. Please check your connection.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

/**
 * Helper function to check if error is a specific status code
 */
export const isErrorStatus = (error: unknown, status: number): boolean => {
  return axios.isAxiosError(error) && error.response?.status === status;
};

/**
 * Helper function to retry failed requests
 */
export const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    await new Promise<void>(resolve => setTimeout(() => resolve(), delay));
    return retryRequest(fn, retries - 1, delay * 2); // Exponential backoff
  }
};

export default apiClient;

// TypeScript type augmentation for metadata
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}
