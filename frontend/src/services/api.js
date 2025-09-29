
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
});













export const authAPI = {
  register: async (userData) => {
    try {
      return await api.post('/auth/register', userData);
    } catch (error) {
  console.warn('Backend unavailable, registration failed');
  throw error;
    }
  },
  login: async (credentials) => {
    try {
      return await api.post('/auth/login', credentials);
    } catch (error) {
  console.warn('Backend unavailable, login failed');
  throw error;
    }
  },
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/categories'),
  createProduct: (data) => api.post('/products', data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
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

