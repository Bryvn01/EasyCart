import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Products from '../pages/Products';
import * as api from '../services/api';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

// Mock lodash debounce
jest.mock('lodash', () => ({
  debounce: jest.fn((fn) => fn)
}));

// Mock the services API module
jest.mock('../services/api', () => ({
  productsAPI: {
    getProducts: jest.fn(),
    getCategories: jest.fn()
  },
  ordersAPI: {
    addToCart: jest.fn()
  }
}));

const mockProducts = {
  data: {
    results: [
      { id: 1, name: 'Test Product', price: 100, category: 'Electronics', image: 'test.jpg', description: 'Test desc', stock: 10, rating: 4.5, brand: 'Test' }
    ],
    count: 1
  }
};

// Mock the context hooks directly
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    loading: false,
    isAuthenticated: false
  })
}));

jest.mock('../context/CartContext', () => ({
  useCart: () => ({
    cartCount: 0,
    fetchCartCount: jest.fn()
  })
}));

const MockAuthProvider = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'auth-provider' }, children);
};

const MockCartProvider = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'cart-provider' }, children);
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <MockAuthProvider>
        <MockCartProvider>
          {component}
        </MockCartProvider>
      </MockAuthProvider>
    </BrowserRouter>
  );
};

describe('Products Page', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock the API calls
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    api.productsAPI.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Electronics' }] });
  });

  test('renders products list', async () => {
    renderWithProviders(<Products />);
    
    // Debug: check screen output after waiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    screen.debug();
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('filters products by search', async () => {
    renderWithProviders(<Products />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    await waitFor(() => {
      expect(api.productsAPI.getProducts).toHaveBeenCalledWith(expect.objectContaining({
        search: 'Test'
      }));
    });
  });
});