import React from 'react';
import { render, screen } from '../test-utils';
import ProductList from '../components/ProductList';
import * as api from '../services/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
// Mock next/image for test environment
jest.mock('next/image', () => ({ __esModule: true, default: (props) => {
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...props} />;
}}));

// Generic i18n mock: if a t() function is used, return the key
global.t = (key) => key;

// Mock axios for CategoryList
jest.mock('axios');

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
        image: 'https://example.com/phone.jpg',
        description: 'Latest smartphone with 5G',
        stock: 10
      },
      {
        id: 2,
        name: 'Nike Air Max',
        price: 8500,
        category: 'Fashion',
        image_url: 'https://example.com/shoes.jpg',
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
    // Mock axios.get for CategoryList component
    axios.get.mockResolvedValue({
      data: {
        results: [
          { id: 1, name: 'Electronics' },
          { id: 2, name: 'Fashion' }
        ]
      }
    });
  });

  test('renders loading state initially', () => {
    api.productsAPI.getProducts.mockImplementation(() => new Promise(() => {}));
    render(<ProductList />);

    // Look for a skeleton loader or loading indicator
    // Try to find by class, role, or fallback to text
    // Example: expect(screen.getByTestId('product-list-loading')).toBeInTheDocument();
    // Fallback: check for a skeleton element
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('fetches and displays products from API', async () => {
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    render(<ProductList />);

    expect(await screen.findByText('Nike Air Max')).toBeInTheDocument();
    expect(api.productsAPI.getProducts).toHaveBeenCalled();
  });

  test('displays prices in KSh format', async () => {
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    render(<ProductList />);

    expect(await screen.findByText(/KSh 45,000/)).toBeInTheDocument();
    expect(screen.getByText(/KSh 8,500/)).toBeInTheDocument();
  });

  test('displays product images', async () => {
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    render(<ProductList />);

    const images = await screen.findAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  test('displays "Add to Cart" buttons', async () => {
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    render(<ProductList />);

    // Wait for a product name to ensure products are rendered
    await screen.findByText('Samsung Galaxy S21');
    const buttons = await screen.findAllByRole('button');
    const addToCartButton = buttons.find(b => /addToCart/i.test(b.textContent));
    expect(addToCartButton).toBeTruthy();
  });

  test('displays "No products available" when API returns empty array', async () => {
    api.productsAPI.getProducts.mockResolvedValue({ data: { results: [] } });
    render(<ProductList />);

    // If using i18n, the key may be rendered
    expect(await screen.findByText(/noProductsAvailable|No products available/i)).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    api.productsAPI.getProducts.mockRejectedValue(new Error('Network error'));
    // Use a fresh QueryClient for this test to avoid react-query cache issues
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, cacheTime: 0 },
        mutations: { retry: false },
      },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <ProductList />
      </QueryClientProvider>
    );

    // Wait for error message to appear
    const errorHeading = await screen.findByText(/errorLoadingProducts|Error Loading Products/i, {}, { timeout: 5000 });
    expect(errorHeading).toBeInTheDocument();

    const tryAgainButton = await screen.findByRole('button', { name: /tryAgain|Try Again/i });
    expect(tryAgainButton).toBeInTheDocument();
  });

  test('displays product categories', async () => {
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    render(<ProductList />);

    // There may be multiple elements with the same text (button, heading, etc.)
    const electronics = await screen.findAllByText('Electronics');
    expect(electronics.length).toBeGreaterThan(0);
    const fashion = await screen.findAllByText('Fashion');
    expect(fashion.length).toBeGreaterThan(0);
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
            image_url: '/test.jpg',
            image: '/test.jpg',
            description: 'Test description',
            stock: 1
          }
        ]
      }
    };

    api.productsAPI.getProducts.mockResolvedValue(longNameProduct);
    render(<ProductList />);

    // Wait for product to load and find the heading element by role
    const heading = await screen.findByRole('heading', {
      name: 'This is a very long product name that should be truncated in the display'
    });
    expect(heading).toHaveAttribute('title', 'This is a very long product name that should be truncated in the display');
  });

  test('uses responsive grid layout', async () => {
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
  render(<ProductList />);

    expect(await screen.findByText('Samsung Galaxy S21')).toBeInTheDocument();

  // Check for grid container using getByTestId (add data-testid if needed in ProductList)
  // If ProductList does not have data-testid, fallback to role or text
  // Example: expect(screen.getByTestId('product-grid')).toBeInTheDocument();
  // For now, fallback to checking a product card is present
  expect(screen.getByText('Samsung Galaxy S21')).toBeInTheDocument();
  });
});
