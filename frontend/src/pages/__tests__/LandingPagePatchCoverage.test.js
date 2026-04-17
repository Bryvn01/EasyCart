import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../LandingPage';
import { productsAPI } from '../../services/api';
import { checkApiHealth, retryWithBackoff } from '../../utils/errorHandler';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

jest.mock('../../services/api', () => ({
  productsAPI: {
    getProducts: jest.fn(),
    getCategories: jest.fn()
  },
  ordersAPI: {
    addToCart: jest.fn()
  },
  getApiBaseUrl: jest.fn(() => 'http://localhost:8000/api')
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false })
}));

jest.mock('../../context/CartContext', () => ({
  useCart: () => ({ fetchCartCount: jest.fn() })
}));

jest.mock('../../hooks/useGuestCart', () => () => ({
  addToGuestCart: jest.fn(),
  migrateGuestCartToServer: jest.fn(async () => ({ success: true, itemsMigrated: 0 })),
  guestCartCount: 0
}));

jest.mock('../../components/AuthModal', () => () => null);
jest.mock('../../components/MobileSearchBar', () => () => <div data-testid="mobile-search-bar" />);
jest.mock('react-helmet-async', () => ({
  Helmet: ({ children }) => <>{children}</>
}));
jest.mock('../../components/HorizontalCategoryScroll', () => (props) => (
  <button
    type="button"
    data-testid="category-trigger"
    onClick={() => props.onSelectCategory('Home & Living')}
  >
    Select Category
  </button>
));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('../../utils/errorHandler', () => ({
  handleApiError: jest.fn(),
  handleApiSuccess: jest.fn(),
  retryWithBackoff: jest.fn(),
  checkApiHealth: jest.fn(),
  getDetailedErrorMessage: jest.fn(() => ({
    type: 'UNKNOWN',
    canRetry: true,
    technical: 'Unknown',
    userMessage: 'Failed to load products and categories'
  }))
}));

describe('LandingPage patch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    checkApiHealth.mockResolvedValue(true);
    retryWithBackoff.mockImplementation(async (fn) => fn());

    productsAPI.getProducts.mockResolvedValue({
      data: {
        results: [
          { id: 1, name: 'Rated Item', price: 1000, stock: 5, rating: 4.5, image: 'rated.jpg' },
          { id: 2, name: 'Unrated Item', price: 500, stock: 8, image: 'unrated.jpg' }
        ]
      }
    });

    productsAPI.getCategories.mockResolvedValue({
      data: {
        results: [
          { id: 1, name: 'Home & Living' }
        ]
      }
    });
  });

  test('shows verified rating values and unrated fallback while removing dead CTA copy', async () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Rated Item')).toBeInTheDocument();
    });
    expect(screen.getByText('Unrated Item')).toBeInTheDocument();

    expect(screen.getByText('(4.5)')).toBeInTheDocument();
    expect(screen.getByText('No ratings yet')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /shop online across kenya/i })).toBeInTheDocument();
    expect(screen.queryByText('Get Mobile App')).not.toBeInTheDocument();
  });

  test('uses SPA navigation when selecting a category from horizontal scroll', async () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('category-trigger')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('category-trigger'));

    expect(mockNavigate).toHaveBeenCalledWith('/products?category=Home%20%26%20Living');
  });
});
