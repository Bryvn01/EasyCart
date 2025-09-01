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

jest.mock('../services/api');

const mockProducts = {
  data: {
    results: [
      { id: 1, name: 'Test Product', price: 100, category: 'Electronics', image: 'test.jpg', description: 'Test desc', stock: 10, rating: 4.5, brand: 'Test' }
    ],
    count: 1
  }
};

const MockAuthProvider = ({ children }) => {
  const mockValue = {
    user: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    loading: false,
    isAuthenticated: false
  };
  return React.createElement('div', { 'data-testid': 'auth-provider' }, children);
};

const MockCartProvider = ({ children }) => {
  const mockValue = {
    cartCount: 0,
    fetchCartCount: jest.fn()
  };
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
    api.productsAPI.getProducts.mockResolvedValue(mockProducts);
    api.productsAPI.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Electronics' }] });
  });

  test('renders products list', async () => {
    renderWithProviders(<Products />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
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