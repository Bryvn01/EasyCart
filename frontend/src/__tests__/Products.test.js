import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
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
    render(<Products />);

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

    render(<Products />);

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

    render(<Products />);

    // Wait for error handling to complete
    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
  });

  test('filters products by search', async () => {
    render(<Products />);

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
    render(<Products />);

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
    render(<Products />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Another Product')).toBeInTheDocument();
    });

    // Check that out of stock badge is displayed for second product
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  test('shows clear filters button when filters are active', async () => {
    render(<Products />);

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

  test('renders pagination controls when there are multiple pages', async () => {
    // Mock response with more products to trigger pagination
    const manyProducts = {
      data: {
        count: 25, // More than 12 items (pageSize)
        results: Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          name: `Product ${i + 1}`,
          price: 100 * (i + 1),
          category: 'Electronics',
          image: 'test.jpg',
          description: 'Test description',
          stock: 10
        }))
      }
    };

    api.productsAPI.getProducts.mockResolvedValue(manyProducts);
    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    // Check for pagination controls
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
  });

  test('navigates to next page when Next button is clicked', async () => {
    const manyProducts = {
      data: {
        count: 25,
        results: Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          name: `Product ${i + 1}`,
          price: 100,
          category: 'Electronics',
          image: 'test.jpg',
          description: 'Test description',
          stock: 10
        }))
      }
    };

    api.productsAPI.getProducts.mockResolvedValue(manyProducts);
    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Wait for new page to load
    await waitFor(() => {
      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();
    });
  });

  test('disables Previous button on first page', async () => {
    const manyProducts = {
      data: {
        count: 25,
        results: Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          name: `Product ${i + 1}`,
          price: 100,
          category: 'Electronics',
          image: 'test.jpg',
          description: 'Test description',
          stock: 10
        }))
      }
    };

    api.productsAPI.getProducts.mockResolvedValue(manyProducts);
    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  test('handles image load error with fallback', async () => {
    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Find the image element using alt text
    const firstImage = screen.getAllByRole('img')[0];

    // Simulate image error
    fireEvent.error(firstImage);

    // Check that image is hidden (display: none)
    expect(firstImage.style.display).toBe('none');
  });

  test('resets to first page when search term changes', async () => {
    const manyProducts = {
      data: {
        count: 25,
        results: Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          name: `Product ${i + 1}`,
          price: 100,
          category: 'Electronics',
          image: 'test.jpg',
          description: 'Test description',
          stock: 10
        }))
      }
    };

    api.productsAPI.getProducts.mockResolvedValue(manyProducts);
    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    // Navigate to page 2
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();
    });

    // Now search for something
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Laptop' } });

    // Should reset to page 1
    await waitFor(() => {
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
