
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://easycart-backend.onrender.com/api';
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh: refreshToken
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);










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
  getBrands: () => api.get('/products/brands'),
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

