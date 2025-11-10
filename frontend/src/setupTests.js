// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock axios globally
jest.mock('axios', () => ({
  default: {
    get: jest.fn(() => Promise.resolve({ data: { results: [] } })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    create: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ data: {} })),
      post: jest.fn(() => Promise.resolve({ data: {} })),
      put: jest.fn(() => Promise.resolve({ data: {} })),
      delete: jest.fn(() => Promise.resolve({ data: {} })),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    }))
  },
  get: jest.fn(() => Promise.resolve({ data: { results: [] } })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn()
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: jest.fn() }
  })
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/' })
}));

// Mock scrollIntoView (not available in JSDOM)
Element.prototype.scrollIntoView = jest.fn();

// Mock IntersectionObserver (not available in JSDOM)
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }

  observe() {
    // Immediately trigger the callback to simulate intersection
    this.callback([{ isIntersecting: true, target: {} }], this);
    return null;
  }

  unobserve() {
    return null;
  }

  disconnect() {
    return null;
  }
};

// Mock ResizeObserver (not available in JSDOM)
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    return null;
  }

  unobserve() {
    return null;
  }

  disconnect() {
    return null;
  }
};

// Mock matchMedia (not available in JSDOM)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the api services module
jest.mock('./services/api', () => ({
  ordersAPI: {
    getCart: jest.fn(() => Promise.resolve({ data: { items: [] } })),
    addToCart: jest.fn(() => Promise.resolve({ data: {} })),
    removeFromCart: jest.fn(() => Promise.resolve({ data: {} })),
    updateCartItem: jest.fn(() => Promise.resolve({ data: {} })),
    moveToWishlist: jest.fn(() => Promise.resolve({ data: {} })),
    getOrders: jest.fn(() => Promise.resolve({ data: { results: [] } })),
    getOrder: jest.fn(() => Promise.resolve({ data: {} })),
    checkout: jest.fn(() => Promise.resolve({ data: {} })),
    initiatePayment: jest.fn(() => Promise.resolve({ data: {} })),
    getPaymentStatus: jest.fn(() => Promise.resolve({ data: {} })),
    updateOrderStatus: jest.fn(() => Promise.resolve({ data: {} })),
  },
  productsAPI: {
    getProducts: jest.fn(() => Promise.resolve({ data: { results: [] } })),
    getProduct: jest.fn(() => Promise.resolve({ data: {} })),
    getCategories: jest.fn(() => Promise.resolve({ data: { results: [] } })),
    createProduct: jest.fn(() => Promise.resolve({ data: {} })),
    deleteProduct: jest.fn(() => Promise.resolve({ data: {} })),
    updateProduct: jest.fn(() => Promise.resolve({ data: {} })),
  },
  authAPI: {
    register: jest.fn(() => Promise.resolve({ data: {} })),
    login: jest.fn(() => Promise.resolve({ data: { access: 'token', refresh: 'token' } })),
    getProfile: jest.fn(() => Promise.resolve({ data: {} })),
    updateProfile: jest.fn(() => Promise.resolve({ data: {} })),
    forgotPassword: jest.fn(() => Promise.resolve({ data: {} })),
    resetPassword: jest.fn(() => Promise.resolve({ data: {} })),
  },
  wishlistAPI: {
    getWishlist: jest.fn(() => Promise.resolve({ data: { results: [] } })),
    addToWishlist: jest.fn(() => Promise.resolve({ data: {} })),
    removeFromWishlist: jest.fn(() => Promise.resolve({ data: {} })),
    moveToCart: jest.fn(() => Promise.resolve({ data: {} })),
    checkWishlistStatus: jest.fn(() => Promise.resolve({ data: { in_wishlist: false } })),
  },
  reviewsAPI: {
    getProductReviews: jest.fn(() => Promise.resolve({ data: { results: [] } })),
    createReview: jest.fn(() => Promise.resolve({ data: {} })),
    markReviewHelpful: jest.fn(() => Promise.resolve({ data: {} })),
  },
  adminAPI: {
    getDashboardStats: jest.fn(() => Promise.resolve({ data: {} })),
    getOrdersAdmin: jest.fn(() => Promise.resolve({ data: { results: [] } })),
    updateOrderStatus: jest.fn(() => Promise.resolve({ data: {} })),
  },
  customersAPI: {
    list: jest.fn(() => Promise.resolve({ data: { results: [] } })),
    retrieve: jest.fn(() => Promise.resolve({ data: {} })),
    update: jest.fn(() => Promise.resolve({ data: {} })),
    partialUpdate: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  },
  getApiBaseUrl: jest.fn(() => 'http://localhost:8000/api'),
}));
