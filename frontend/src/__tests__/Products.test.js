import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Products from '../pages/Products';
import * as api from '../services/api';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

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
      },
      { 
        id: 2, 
        name: 'Another Product', 
        price: 200, 
        category: 'Fashion', 
        image: 'test2.jpg', 
        description: 'Another test description for the product', 
        stock: 0, 
        rating: 3.5, 
        brand: 'Test Brand 2' 
      }
    ],
    count: 2
  }
};

const mockCategories = {
  data: [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Fashion' }
  ]
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {component}
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Products Page', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Clear localStorage to ensure clean state
    localStorage.clear();
    
    // Setup API mocks
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    api.productsAPI.getCategories.mockResolvedValue(mockCategories);
    
    // Mock auth API to prevent AuthProvider from making API calls
    api.authAPI.getProfile.mockRejectedValue(new Error('Not authenticated'));
    
    // Mock cart API to prevent CartProvider from making API calls
    api.ordersAPI.getCart.mockResolvedValue({ data: { items: [] } });
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
    
    // Verify multiple products are rendered
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Another Product')).toBeInTheDocument();
  });

  test('displays loading state initially', async () => {
    // Make API calls take longer to resolve
    api.productsAPI.getProducts.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockProducts), 100)));
    api.productsAPI.getCategories.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockCategories), 100)));
    
    renderWithProviders(<Products />);
    
    // Loading skeleton shows multiple placeholder divs with animate-pulse
    // We can check that the test product is not yet visible
    expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
    
    // Wait for loading to complete and product to appear
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    // Mock API to reject
    api.productsAPI.getProducts.mockRejectedValue(new Error('API Error'));
    api.productsAPI.getCategories.mockRejectedValue(new Error('API Error'));
    
    renderWithProviders(<Products />);
    
    // Wait for error handling to complete
    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
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

  test('filters products by category', async () => {
    renderWithProviders(<Products />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
    
    // Find and use category dropdown
    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: '1' } });
    
    // Wait for API call with category filter
    await waitFor(() => {
      expect(api.productsAPI.getProducts).toHaveBeenCalledWith(expect.objectContaining({
        category: '1'
      }));
    });
  });

  test('displays out of stock badge for products with no stock', async () => {
    renderWithProviders(<Products />);
    
    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Another Product')).toBeInTheDocument();
    });
    
    // Check that out of stock badge is displayed for second product
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  test('shows clear filters button when filters are active', async () => {
    renderWithProviders(<Products />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
    
    // Apply a search filter
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    // Wait for active filters section to appear
    await waitFor(() => {
      expect(screen.getByText('Active Filters:')).toBeInTheDocument();
    });
    
    // Check that clear all button is present
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });
});