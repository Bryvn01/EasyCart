import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import ProductList from '../components/ProductList';
import * as api from '../services/api';
import * as errorHandler from '../utils/errorHandler';

// Mock the API module
jest.mock('../services/api');

// Mock the error handler utilities
jest.mock('../utils/errorHandler', () => ({
  handleApiError: jest.fn(),
  retryWithBackoff: jest.fn((fn) => fn()), // Just execute the function directly in tests
  getDetailedErrorMessage: jest.fn((error) => ({
    type: 'UNKNOWN',
    message: error.message || 'An error occurred',
    userMessage: error.message || 'An error occurred',
    technical: error.toString(),
    canRetry: true
  })),
  checkApiHealth: jest.fn(() => Promise.resolve(true)),
}));

const mockProducts = {
  data: {
    results: [
      { 
        id: 1, 
        name: 'Samsung Galaxy S21', 
        price: 45000, 
        category: 'Electronics', 
        image_url: 'https://example.com/phone.jpg',
        description: 'Latest smartphone with 5G', 
        stock: 10
      },
      { 
        id: 2, 
        name: 'Nike Air Max', 
        price: 8500, 
        category: 'Fashion', 
        image: 'https://example.com/shoes.jpg',
        description: 'Comfortable running shoes', 
        stock: 5
      }
    ]
  }
};

describe('ProductList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock getApiBaseUrl
    api.getApiBaseUrl = jest.fn(() => 'https://easycart-backend.onrender.com/api');
  });

  test('renders loading state initially', () => {
    api.productsAPI.getProducts.mockImplementation(() => new Promise(() => {}));
    render(<ProductList />);
    
    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  test('fetches and displays products from API', async () => {
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    render(<ProductList />);
    
    await waitFor(() => {
      expect(screen.getByText('Samsung Galaxy S21')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Nike Air Max')).toBeInTheDocument();
    expect(api.productsAPI.getProducts).toHaveBeenCalledTimes(1);
  });

  test('displays prices in KSh format', async () => {
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    render(<ProductList />);
    
    await waitFor(() => {
      expect(screen.getByText(/KSh 45,000/)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/KSh 8,500/)).toBeInTheDocument();
  });

  test('displays product images', async () => {
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    render(<ProductList />);
    
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  test('displays "Add to Cart" buttons', async () => {
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    render(<ProductList />);
    
    await waitFor(() => {
      const buttons = screen.getAllByText('Add to Cart');
      expect(buttons).toHaveLength(2);
    });
  });

  test('displays "No products available" when API returns empty array', async () => {
    api.productsAPI.getProducts.mockResolvedValue({ data: { results: [] } });
    render(<ProductList />);
    
    await waitFor(() => {
      expect(screen.getByText('No products available')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    api.productsAPI.getProducts.mockRejectedValue(new Error('Network error'));
    render(<ProductList />);
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Products')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Try Again/)).toBeInTheDocument();
  });

  test('displays product categories', async () => {
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    render(<ProductList />);
    
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Fashion')).toBeInTheDocument();
  });

  test('truncates long product names with title attribute', async () => {
    const longNameProduct = {
      data: {
        results: [
          { 
            id: 1, 
            name: 'This is a very long product name that should be truncated in the display', 
            price: 1000, 
            category: 'Test',
            image_url: 'test.jpg',
            description: 'Test description', 
            stock: 1
          }
        ]
      }
    };
    
    api.productsAPI.getProducts.mockResolvedValue(longNameProduct);
    render(<ProductList />);
    
    await waitFor(() => {
      const heading = screen.getByText('This is a very long product name that should be truncated in the display');
      expect(heading).toHaveAttribute('title', 'This is a very long product name that should be truncated in the display');
    });
  });

  test('uses responsive grid layout', async () => {
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    const { container } = render(<ProductList />);
    
    await waitFor(() => {
      expect(screen.getByText('Samsung Galaxy S21')).toBeInTheDocument();
    });
    
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-2');
    expect(gridContainer).toHaveClass('md:grid-cols-4');
  });
});
