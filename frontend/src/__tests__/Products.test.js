import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Products from '../pages/Products';
import * as api from '../services/api';

// Mock the API module
jest.mock('../services/api');

// Mock SearchInput component to avoid lodash debounce issues
jest.mock('../components/ui/SearchInput', () => {
  return function MockSearchInput({ onSearch, placeholder }) {
    return (
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
        data-testid="search-input"
      />
    );
  };
});

const mockProducts = {
  data: {
    results: [
      { 
        id: 1, 
        name: 'Test Product', 
        price: 100, 
        category: 'Electronics', 
        image: 'test.jpg', 
        description: 'Test description for the product', 
        stock: 10, 
        rating: 4.5, 
        brand: 'Test Brand' 
      }
    ],
    count: 1
  }
};

const mockCategories = {
  data: [{ id: 1, name: 'Electronics' }]
};

// Create proper context providers
const MockAuthProvider = ({ children }) => {
  const mockValue = {
    user: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    loading: false,
    isAuthenticated: false
  };
  
  return React.createElement(
    'div', 
    { 'data-testid': 'auth-provider' }, 
    React.createElement(
      React.createContext().Provider,
      { value: mockValue },
      children
    )
  );
};

const MockCartProvider = ({ children }) => {
  const mockValue = {
    cartCount: 0,
    fetchCartCount: jest.fn(),
    updateCartCount: jest.fn()
  };
  
  return React.createElement(
    'div', 
    { 'data-testid': 'cart-provider' }, 
    React.createElement(
      React.createContext().Provider,
      { value: mockValue },
      children
    )
  );
};

// Mock the context hooks
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    loading: false,
    isAuthenticated: false
  }),
  AuthProvider: ({ children }) => children
}));

jest.mock('../context/CartContext', () => ({
  useCart: () => ({
    cartCount: 0,
    fetchCartCount: jest.fn(),
    updateCartCount: jest.fn()
  }),
  CartProvider: ({ children }) => children
}));

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
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup API mocks
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    api.productsAPI.getCategories.mockResolvedValue(mockCategories);
  });

  test('renders products list', async () => {
    renderWithProviders(<Products />);
    
    // Wait for loading to complete and products to render
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify API calls were made
    expect(api.productsAPI.getProducts).toHaveBeenCalled();
    expect(api.productsAPI.getCategories).toHaveBeenCalled();
  });

  test('filters products by search', async () => {
    renderWithProviders(<Products />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    // Wait for debounced search to trigger
    await waitFor(() => {
      expect(api.productsAPI.getProducts).toHaveBeenCalledWith(expect.objectContaining({
        search: 'Test'
      }));
    }, { timeout: 1000 });
  });
});