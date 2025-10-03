import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
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