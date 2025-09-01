import axios from 'axios';
import { mockProducts, mockCategories } from './mockData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const USE_MOCK_DATA = !process.env.REACT_APP_API_URL && process.env.NODE_ENV === 'production';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Mock API responses for production
const mockAPI = {
  get: (url) => {
    if (url === '/products/') {
      return Promise.resolve({ data: { results: mockProducts, count: mockProducts.length } });
    }
    if (url === '/products/categories/') {
      return Promise.resolve({ data: mockCategories });
    }
    if (url.startsWith('/products/') && url.endsWith('/')) {
      const id = parseInt(url.split('/')[2]);
      const product = mockProducts.find(p => p.id === id);
      return product ? Promise.resolve({ data: product }) : Promise.reject({ status: 404 });
    }
    return Promise.reject({ status: 404 });
  },
  post: () => Promise.resolve({ data: { message: 'Mock API - Feature not available' } }),
  put: () => Promise.resolve({ data: { message: 'Mock API - Feature not available' } }),
  delete: () => Promise.resolve({ data: { message: 'Mock API - Feature not available' } }),
  patch: () => Promise.resolve({ data: { message: 'Mock API - Feature not available' } })
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  forgotPassword: (data) => api.post('/auth/forgot-password/', data),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
};

export const productsAPI = {
  getProducts: (params) => USE_MOCK_DATA ? mockAPI.get('/products/') : api.get('/products/', { params }),
  getProduct: (id) => USE_MOCK_DATA ? mockAPI.get(`/products/${id}/`) : api.get(`/products/${id}/`),
  getCategories: () => USE_MOCK_DATA ? mockAPI.get('/products/categories/') : api.get('/products/categories/'),
  deleteProduct: (id) => USE_MOCK_DATA ? mockAPI.delete(`/products/${id}/`) : api.delete(`/products/${id}/`),
  updateProduct: (id, data) => USE_MOCK_DATA ? mockAPI.put(`/products/${id}/`, data) : api.put(`/products/${id}/`, data),
};

export const ordersAPI = {
  getOrders: () => api.get('/orders/'),
  getOrder: (id) => api.get(`/orders/${id}/`),
  getCart: () => api.get('/orders/cart/'),
  addToCart: (data) => api.post('/orders/cart/add/', data),
  removeFromCart: (itemId) => api.delete(`/orders/cart/remove/${itemId}/`),
  checkout: (data) => api.post('/orders/checkout/', data),
  initiatePayment: (data) => api.post('/orders/payment/initiate/', data),
  getPaymentStatus: (orderId) => api.get(`/orders/payment/status/${orderId}/`),
  updateOrderStatus: (orderId, data) => api.patch(`/orders/${orderId}/`, data),
};

export const wishlistAPI = {
  getWishlist: () => api.get('/products/wishlist/'),
  addToWishlist: (productId) => api.post('/products/wishlist/add/', { product_id: productId }),
  removeFromWishlist: (itemId) => api.delete(`/products/wishlist/remove/${itemId}/`),
  checkWishlistStatus: (productId) => api.get(`/products/wishlist/check/${productId}/`),
};

export const reviewsAPI = {
  getProductReviews: (productId) => api.get(`/products/reviews/${productId}/`),
  createReview: (data) => api.post('/products/reviews/create/', data),
  markReviewHelpful: (reviewId, isHelpful = true) => api.post('/products/reviews/helpful/', { 
    review_id: reviewId, 
    is_helpful: isHelpful 
  }),
};

export const adminAPI = {
  getDashboardStats: (days = 30) => api.get(`/admin/dashboard/?days=${days}`),
  getOrdersAdmin: (params) => api.get('/admin/orders/', { params }),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/`, { status }),
};

export default api;
