import axios from 'axios';


// === IMPORTANT: Always use .env for production API URL ===
// Never use demo/mock mode or fallback URL in production!
const API_BASE_URL = process.env.REACT_APP_API_URL;
if (!API_BASE_URL) {
  throw new Error('REACT_APP_API_URL is not set! Please check your .env file.');
}

if (process.env.NODE_ENV === 'development') {
  console.log('Admin Dashboard API Configuration:', {
    baseURL: API_BASE_URL,
    timestamp: new Date().toISOString()
  });
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  loginWith2FA: (email, token) => api.post('/auth/login/2fa/', { email, token }),
  getProfile: () => api.get('/auth/profile/'),
  setup2FA: () => api.post('/auth/2fa/setup/'),
  enable2FA: (token) => api.post('/auth/2fa/enable/', { token }),
  disable2FA: (token) => api.post('/auth/2fa/disable/', { token }),
  get2FAStatus: () => api.get('/auth/2fa/status/'),
};

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/'),

  // Product APIs (Admin endpoints)
  getProducts: (params) => api.get('/products/admin/products/', { params }),
  getProduct: (id) => api.get(`/products/admin/products/${id}/`),
  createProduct: (data) => api.post('/products/admin/products/', data),
  updateProduct: (id, data) => api.put(`/products/admin/products/${id}/`, data),
  deleteProduct: (id) => api.delete(`/products/admin/products/${id}/`),
  bulkDeleteProducts: (ids) => api.post('/products/admin/products/bulk_delete/', { ids }),
  updateStock: (id, operation, value) => api.post(`/products/admin/products/${id}/update_stock/`, { operation, value }),
  uploadImage: (formData) => api.post('/products/admin/upload-image/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Category APIs (Admin endpoints)
  getCategories: () => api.get('/products/admin/categories/'),
  createCategory: (data) => api.post('/products/admin/categories/', data),
  updateCategory: (id, data) => api.put(`/products/admin/categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`/products/admin/categories/${id}/`),

  // Order APIs (Admin endpoints)
  getOrders: (params) => api.get('/orders/admin/orders/', { params }),
  getOrder: (id) => api.get(`/orders/admin/orders/${id}/`),
  updateOrderStatus: (id, status) => api.patch(`/orders/admin/orders/${id}/`, { status }),
};

export const customersAPI = {
  list: (params) => api.get('/auth/customers/', { params }),
  retrieve: (id) => api.get(`/auth/customers/${id}/`),
  update: (id, data) => api.put(`/auth/customers/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/auth/customers/${id}/`, data),
  delete: (id) => api.delete(`/auth/customers/${id}/`),
};

export const notificationService = {
  getNotifications: (page = 1, params = {}) =>
    api.get('/orders/staff/notifications/', { params: { page, ...params } }),
  getUnreadCount: () =>
    api.get('/orders/staff/notifications/unread-count/'),
  markAsRead: (notificationId) =>
    api.patch(`/orders/staff/notifications/${notificationId}/`, { is_read: true }),
  markAllRead: () =>
    api.patch('/orders/staff/notifications/mark-all-read/'),
};

// Add getCustomers to adminAPI for dashboard
adminAPI.getCustomers = () => api.get('/auth/customers/');

export default api;
