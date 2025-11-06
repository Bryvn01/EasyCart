import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import EnhancedProductCard from '../components/EnhancedProductCard';

// Mock useCart hook
const mockAddToCart = jest.fn();
const mockUseCart = {
  addToCart: mockAddToCart,
  cartCount: 0,
  cart: null,
  loading: false,
  fetchCart: jest.fn(),
  updateCartItem: jest.fn(),
  removeFromCart: jest.fn(),
  moveToWishlist: jest.fn(),
  updateCartCount: jest.fn()
};

jest.mock('../context/CartContext', () => ({
  ...jest.requireActual('../context/CartContext'),
  useCart: () => mockUseCart
}));

const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'Test description',
  price: 1000,
  stock: 10,
  image: '/test-image.jpg'
};

const renderComponent = (product = mockProduct) => {
  return render(<EnhancedProductCard product={product} />);
};

describe('EnhancedProductCard', () => {
  beforeEach(() => {
    mockAddToCart.mockClear();
  });

  test('renders product information correctly', () => {
    renderComponent();

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText(/KSh 1,000/)).toBeInTheDocument();
  });

  test('add to cart button has minimum 44x44px touch target', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /add test product to cart/i });
    const styles = window.getComputedStyle(button);

    // Check min-height is at least 48px (exceeds 44px requirement)
    const minHeight = parseInt(styles.minHeight) || parseInt(styles.height);
    expect(minHeight).toBeGreaterThanOrEqual(44);
  });

  test('prevents duplicate taps on add to cart', async () => {
    mockAddToCart.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderComponent();

    const button = screen.getByRole('button', { name: /add test product to cart/i });

    // Rapid fire clicks
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    // Should only call addToCart once
    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledTimes(1);
    });
  });

  test('shows loading state during add to cart', async () => {
    mockAddToCart.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderComponent();

    const button = screen.getByRole('button', { name: /add test product to cart/i });
    fireEvent.click(button);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText('Adding...')).toBeInTheDocument();
    });

    // Button should be disabled
    expect(button).toBeDisabled();

    // Wait for operation to complete
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  test('shows success toast on successful add to cart', async () => {
    mockAddToCart.mockResolvedValue({});

    renderComponent();

    const button = screen.getByRole('button', { name: /add test product to cart/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/added to cart/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('shows error toast on failed add to cart', async () => {
    mockAddToCart.mockRejectedValue(new Error('Failed to add'));

    renderComponent();

    const button = screen.getByRole('button', { name: /add test product to cart/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/failed to add/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('disables button when product is out of stock', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    renderComponent(outOfStockProduct);

    const button = screen.getByRole('button', { name: /add test product to cart/i });
    expect(button).toBeDisabled();
    expect(screen.getAllByText('Out of Stock').length).toBeGreaterThan(0);
  });

  test('image has lazy loading attribute', () => {
    renderComponent();

    const image = screen.getByAlt('Test Product');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  test('image has srcset for responsive images', () => {
    renderComponent();

    const image = screen.getByAlt('Test Product');
    expect(image).toHaveAttribute('srcset');
  });

  test('has proper ARIA attributes', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /add test product to cart/i });
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-live', 'polite');
  });
});
