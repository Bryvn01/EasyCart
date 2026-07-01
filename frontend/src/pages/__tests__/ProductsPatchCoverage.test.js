import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Products from '../Products';
import { useProducts } from '../../hooks/useProducts';
import { productsAPI } from '../../services/api';

jest.mock('../../hooks/useProducts');
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false })
}));
jest.mock('../../context/CartContext', () => ({
  useCart: () => ({ fetchCartCount: jest.fn() })
}));
jest.mock('../../hooks/useGuestCart', () => () => ({
  addToGuestCart: jest.fn(),
  guestCartCount: 0,
  migrateGuestCartToServer: jest.fn(async () => ({ success: true, itemsMigrated: 0 }))
}));
jest.mock('../../services/api', () => ({
  productsAPI: {
    getCategories: jest.fn()
  },
  ordersAPI: {
    addToCart: jest.fn()
  }
}));
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('../../components/ProductCard', () => (props) => (
  <div data-testid="product-card">{props.product.name}</div>
));
jest.mock('../../components/ui/SearchInput', () => (props) => (
  <input
    data-testid="search-input"
    placeholder={props.placeholder}
    onChange={(e) => props.onSearch(e.target.value)}
  />
));
jest.mock('../../components/HorizontalCategoryScroll', () => () => <div data-testid="category-scroll" />);
jest.mock('../../components/ImageLightbox', () => () => null);
jest.mock('../../components/SuccessAnimation', () => () => null);
jest.mock('../../components/EmptyState', () => () => <div>No products</div>);
jest.mock('../../components/AuthModal', () => () => null);

describe('Products page patch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    productsAPI.getCategories.mockResolvedValue({ data: [] });
    useProducts.mockReturnValue({
      products: [{ id: 1, name: 'Coffee Beans', price: 1200, stock: 10 }],
      loading: false,
      pagination: {
        totalPages: 2,
        totalCount: 24,
        hasPrevious: false,
        hasNext: true,
        currentPage: 1
      }
    });
    window.scrollTo = jest.fn();
  });

  test('uses neutral active pagination style and auto scroll on page change', async () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Coffee Beans')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: '1' })).toHaveStyle('background: var(--gray-900)');

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'auto'
    });
  });
});
