import axios from 'axios';



// === IMPORTANT: Always use .env for production API URL ===
// Never use demo/mock mode or fallback URL in production!
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Log API configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration:', {
    baseURL: API_BASE_URL,
    env: process.env.REACT_APP_API_URL || '(using default)',
  });
}

const api = axios.create({
  baseURL: API_BASE_URL || '',
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to throw if baseURL is missing at call time
api.interceptors.request.use(
  (config) => {
    if (!API_BASE_URL) {
      throw new Error('REACT_APP_API_URL is not set! Please check your .env file.');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);

// Handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Enhanced error logging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: error.response?.status,
        message: error.message,
        hasResponse: !!error.response,
        hasRequest: !!error.request,
      });
    }

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
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

          // Only redirect if we're not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
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
      return await api.post('/auth/register/', userData);
    } catch (error) {
      console.warn('Backend unavailable, registration failed');
      throw error;
    }
  },
  login: async (credentials) => {
    try {
      return await api.post('/auth/login/', credentials);
    } catch (error) {
      console.warn('Backend unavailable, login failed');
      throw error;
    }
  },
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  forgotPassword: (data) => api.post('/auth/forgot-password/', data),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
};

export const productsAPI = {
  getProducts: (params) =>
    api.get('/products/', { params }).catch(error => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch products:', error.message);
      }
      throw error;
    }),
  getProduct: (id) =>
    api.get(`/products/${id}/`).catch(error => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch product:', id, error.message);
      }
      throw error;
    }),
  getCategories: () =>
    api.get('/products/categories/').catch(error => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch categories:', error.message);
      }
      throw error;
    }),
  createProduct: (data) => {
    // If image_file is present, use FormData
    if (data.image_file) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'image_file' && value) {
          formData.append('image', value); // Backend expects 'image'
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      return api.post('/products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    // Otherwise, send as JSON
    return api.post('/products/', data);
  },
  deleteProduct: (id) => api.delete(`/products/${id}/`),
  updateProduct: (id, data) => {
    if (data.image_file) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'image_file' && value) {
          formData.append('image', value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      return api.put(`/products/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put(`/products/${id}/`, data);
  },
};

export const getApiBaseUrl = () => API_BASE_URL;

export const ordersAPI = {
  getOrders: () => api.get('/orders/'),
  getOrder: (id) => api.get(`/orders/${id}/`),
  getCart: () => api.get('/orders/cart/'),
  addToCart: (data) => api.post('/orders/cart/add/', data),
  removeFromCart: (itemId) => api.delete(`/orders/cart/remove/${itemId}/`),
  updateCartItem: (itemId, quantity) => api.patch(`/orders/cart/update/${itemId}/`, { quantity }),
  moveToWishlist: (itemId) => api.post(`/orders/cart/move-to-wishlist/${itemId}/`),
  checkout: (data) => api.post('/orders/checkout/', data),
  initiatePayment: (data) => api.post('/orders/payment/initiate/', data),
  getPaymentStatus: (orderId) => api.get(`/orders/payment/status/${orderId}/`),
  updateOrderStatus: (orderId, data) => api.patch(`/orders/${orderId}/`, data),
};

export const wishlistAPI = {
  getWishlist: () => api.get('/products/wishlist/'),
  addToWishlist: (productId) => api.post('/products/wishlist/add/', { product_id: productId }),
  removeFromWishlist: (itemId) => api.delete(`/products/wishlist/remove/${itemId}/`),
  moveToCart: (itemId, quantity = 1) => api.post(`/products/wishlist/move-to-cart/${itemId}/`, { quantity }),
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

export default api;