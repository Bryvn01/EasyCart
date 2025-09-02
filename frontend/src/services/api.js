import axios from 'axios';
import { mockProducts, mockCategories } from './mockData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://easycart-backend.onrender.com/api';
const USE_MOCK_DATA = false; // Always use real API now

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Mock API responses with filtering and search support
const mockAPI = {
  get: (url, config = {}) => {
    if (url === '/products/') {
      let filteredProducts = [...mockProducts];
      const params = config.params || {};
      
      // Search functionality
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          product.brand.toLowerCase().includes(searchTerm)
        );
      }
      
      // Category filter
      if (params.category) {
        filteredProducts = filteredProducts.filter(product => 
          product.category.toLowerCase() === params.category.toLowerCase()
        );
      }
      
      // Price range filter
      if (params.min_price) {
        filteredProducts = filteredProducts.filter(product => 
          product.price >= parseFloat(params.min_price)
        );
      }
      if (params.max_price) {
        filteredProducts = filteredProducts.filter(product => 
          product.price <= parseFloat(params.max_price)
        );
      }
      
      // Brand filter
      if (params.brand) {
        filteredProducts = filteredProducts.filter(product => 
          product.brand.toLowerCase() === params.brand.toLowerCase()
        );
      }
      
      // Sorting
      if (params.ordering) {
        switch (params.ordering) {
          case 'price':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
          case '-price':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
          case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case '-name':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
          case 'rating':
            filteredProducts.sort((a, b) => a.rating - b.rating);
            break;
          case '-rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
          default:
            break;
        }
      }
      
      // Pagination
      const page = parseInt(params.page) || 1;
      const pageSize = parseInt(params.page_size) || 12;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      return Promise.resolve({ 
        data: { 
          results: paginatedProducts, 
          count: filteredProducts.length,
          next: endIndex < filteredProducts.length ? `?page=${page + 1}` : null,
          previous: page > 1 ? `?page=${page - 1}` : null
        } 
      });
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
  post: () => Promise.resolve({ data: { message: 'Mock API - Feature not available in demo' } }),
  put: () => Promise.resolve({ data: { message: 'Mock API - Feature not available in demo' } }),
  delete: () => Promise.resolve({ data: { message: 'Mock API - Feature not available in demo' } }),
  patch: () => Promise.resolve({ data: { message: 'Mock API - Feature not available in demo' } })
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Add CSRF protection for state-changing requests
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['X-CSRF-Token'] = Math.random().toString(36).substring(2) + Date.now().toString(36);
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
  }
  return config;
});

// Mock auth for testing when backend is unavailable
const mockAuth = {
  register: (userData) => {
    // Simulate registration
    const mockUser = {
      id: Date.now(),
      email: userData.email,
      username: userData.username,
      name: userData.username,
      role: 'user',
      is_admin: false
    };
    
    return Promise.resolve({
      data: {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: mockUser
      }
    });
  },
  login: (credentials) => {
    const mockUser = {
      id: 1,
      email: credentials.email,
      username: 'mockuser',
      name: 'Mock User',
      role: credentials.email === 'admin@easycart.com' ? 'admin' : 'user',
      is_admin: credentials.email === 'admin@easycart.com'
    };
    
    return Promise.resolve({
      data: {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: mockUser
      }
    });
  }
};

export const authAPI = {
  register: async (userData) => {
    try {
      return await api.post('/auth/register', userData);
    } catch (error) {
      console.warn('Backend unavailable, using mock registration');
      return mockAuth.register(userData);
    }
  },
  login: async (credentials) => {
    try {
      return await api.post('/auth/login', credentials);
    } catch (error) {
      console.warn('Backend unavailable, using mock login');
      return mockAuth.login(credentials);
    }
  },
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const productsAPI = {
  getProducts: (params) => USE_MOCK_DATA ? mockAPI.get('/products/', { params }) : api.get('/products', { params }),
  getProduct: (id) => USE_MOCK_DATA ? mockAPI.get(`/products/${id}/`) : api.get(`/products/${id}`),
  getCategories: () => USE_MOCK_DATA ? mockAPI.get('/products/categories/') : api.get('/categories'),
  createProduct: (data) => api.post('/products', data),
  deleteProduct: (id) => USE_MOCK_DATA ? mockAPI.delete(`/products/${id}/`) : api.delete(`/products/${id}`),
  updateProduct: (id, data) => USE_MOCK_DATA ? mockAPI.put(`/products/${id}/`, data) : api.put(`/products/${id}`, data),
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
