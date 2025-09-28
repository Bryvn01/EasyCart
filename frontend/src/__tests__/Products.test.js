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

// Mock the context hooks
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

jest.mock('../services/api');

const mockProducts = {
  data: {
    results: [
      { id: 1, name: 'Test Product', price: 100, category: 'Electronics', image: 'test.jpg', description: 'Test desc', stock: 10, rating: 4.5, brand: 'Test' }
    ],
    count: 1
  }
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Products Page', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup API mocks with immediate resolution
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    api.productsAPI.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Electronics' }] });
  });

  test('renders products list', async () => {
    renderWithProviders(<Products />);
    
    // Wait for loading to complete and product to appear
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('filters products by search', async () => {
    renderWithProviders(<Products />);
    
    // Wait for component to load completely before trying to interact
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const searchInput = screen.getByPlaceholderText(/search products/i);
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    // Wait for debounced search to be called
    await waitFor(() => {
      expect(api.productsAPI.getProducts).toHaveBeenCalledWith(expect.objectContaining({
        search: 'Test'
      }));
    }, { timeout: 1000 });
  });
});