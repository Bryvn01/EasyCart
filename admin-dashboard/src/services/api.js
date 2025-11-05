// --- Customer Management API ---
export const customersAPI = {
  // Admin: list all customers
  list: (params) => api.get('/auth/customers/', { params }),
  // Admin or self: get customer by id
  retrieve: (id) => api.get(`/auth/customers/${id}/`),
  // Admin or self: update customer
  update: (id, data) => api.put(`/auth/customers/${id}/`, data),
  // Admin or self: partial update
  partialUpdate: (id, data) => api.patch(`/auth/customers/${id}/`, data),
  // Admin or self: delete customer
  delete: (id) => api.delete(`/auth/customers/${id}/`),
};
import axios from 'axios';


// === IMPORTANT: Always use .env for production API URL ===
// Never use demo/mock mode or fallback URL in production!
const API_BASE_URL = process.env.REACT_APP_API_URL;
if (!API_BASE_URL) {
  throw new Error('REACT_APP_API_URL is not set! Please check your .env file.');
}

// Log API configuration for debugging
console.log('Admin Dashboard API Configuration:', {
  baseURL: API_BASE_URL,
  env: process.env.REACT_APP_API_URL || '(using default)',
  timestamp: new Date().toISOString()
});

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token and logging
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log request for debugging
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
    baseURL: config.baseURL,
    timeout: config.timeout,
    hasAuth: !!token
  });

  return config;
}, (error) => {
  console.error('[API Request Error]', error);
  return Promise.reject(error);
});

// Response interceptor - add logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  (error) => {
    console.error('[API Response Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    try {
      console.log('[Auth] Attempting login...', { email: credentials.email });
      const response = await api.post('/auth/login', credentials);
      console.log('[Auth] Login successful:', response.data);
      return response;
    } catch (error) {
      console.error('[Auth] Login failed:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        isNetworkError: !error.response,
        error
      });
      throw error;
    }
  },
  getProfile: async () => {
    try {
      console.log('[Auth] Fetching profile...');
      const response = await api.get('/auth/profile');
      console.log('[Auth] Profile fetched:', response.data);
      return response;
    } catch (error) {
      console.error('[Auth] Profile fetch failed:', {
        status: error.response?.status,
        message: error.message,
        isNetworkError: !error.response
      });
      throw error;
    }
  },
};

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),

  // Product APIs (Admin endpoints)
  getProducts: (params) => api.get('/products/admin/products/', { params }),
  getProduct: (id) => api.get(`/products/admin/products/${id}/`),
  createProduct: (data) => api.post('/products/admin/products/', data),
  updateProduct: (id, data) => api.put(`/products/admin/products/${id}/`, data),
  deleteProduct: (id) => api.delete(`/products/admin/products/${id}/`),
  bulkDeleteProducts: (ids) => api.post('/products/admin/products/bulk_delete/', { ids }),
  updateStock: (id, operation, value) => api.post(`/products/admin/products/${id}/update_stock/`, { operation, value }),

  // Category APIs (Admin endpoints)
  getCategories: () => api.get('/products/admin/categories/'),
  createCategory: (data) => api.post('/products/admin/categories/', data),
  updateCategory: (id, data) => api.put(`/products/admin/categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`/products/admin/categories/${id}/`),

  // Order APIs
  getOrders: (params) => api.get('/orders', { params }),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}`, { status }),
};

export default api;
