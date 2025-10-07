import axios from 'axios';

// Default to Node.js backend (port 5000) for local dev, or production backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://easycart-backend-0u8r.onrender.com/api';

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
  
  // Product APIs (Enhanced)
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  bulkDeleteProducts: (ids) => api.post('/products/bulk-delete', { ids }),
  bulkUpdateProducts: (productIds, updateData) => api.patch('/products/bulk', { productIds, updateData }),
  
  // Inventory Management
  updateStock: (id, stock, operation) => api.patch(`/products/${id}/stock`, { stock, operation }),
  getLowStockProducts: () => api.get('/products/inventory/low-stock'),
  getOutOfStockProducts: () => api.get('/products/inventory/out-of-stock'),
  
  // Image Upload (Enhanced for multiple images)
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadImages: (formData) => api.post('/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteImage: (publicId) => api.delete(`/upload/image/${encodeURIComponent(publicId)}`),
  
  // Category APIs
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  
  // Order APIs
  getOrders: (params) => api.get('/orders', { params }),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}`, { status }),
  
  // User APIs
  getUsers: (params) => api.get('/users', { params }),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),
};

export default api;