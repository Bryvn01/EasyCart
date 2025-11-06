import React from 'react';
import { render, screen, waitFor } from '../test-utils';
import { useCart } from '../context/CartContext';

// Mock the API
jest.mock('../services/api', () => ({
  authAPI: {
    getProfile: jest.fn(() => Promise.resolve({
      data: { id: 1, email: 'test@example.com', username: 'testuser' }
    })),
  },
  ordersAPI: {
    getCart: jest.fn(),
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateCartItem: jest.fn(),
    moveToWishlist: jest.fn(),
  },
}));

const { ordersAPI } = require('../services/api');

// Test component that uses the cart context
const TestComponent = () => {
  const { cartCount, addToCart, updateCartItem, removeFromCart, moveToWishlist } = useCart();

  return (
    <div>
      <div data-testid="cart-count">{cartCount}</div>
      <button onClick={() => addToCart(1, 2)} data-testid="add-to-cart">Add to Cart</button>
      <button onClick={() => updateCartItem(1, 3)} data-testid="update-item">Update Item</button>
      <button onClick={() => removeFromCart(1)} data-testid="remove-item">Remove Item</button>
      <button onClick={() => moveToWishlist(1)} data-testid="move-to-wishlist">Move to Wishlist</button>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Set localStorage token to make user authenticated
    localStorage.setItem('access_token', 'test-token');
    ordersAPI.getCart.mockResolvedValue({
      data: {
        items: [
          { id: 1, quantity: 2, product: { id: 1, name: 'Product 1', price: 100 } }
        ]
      }
    });
  });

  test('provides cart count when authenticated', async () => {
    render(<TestComponent />);

    // Wait for auth to load and cart to fetch
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    }, { timeout: 3000 });
  });

  test('cart count is 0 when not authenticated', async () => {
    ordersAPI.getCart.mockResolvedValue({ data: { items: [] } });
    localStorage.removeItem('access_token'); // Ensure not authenticated

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    });
  });

  test('addToCart calls API and refreshes cart', async () => {
    ordersAPI.addToCart.mockResolvedValue({ data: {} });

    render(<TestComponent />);

    // Wait for component to be ready
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toBeInTheDocument();
    });

    const addButton = screen.getByTestId('add-to-cart');
    addButton.click();

    await waitFor(() => {
      expect(ordersAPI.addToCart).toHaveBeenCalledWith({ product_id: 1, quantity: 2 });
    }, { timeout: 3000 });

    expect(ordersAPI.getCart).toHaveBeenCalled();
  });

  test('updateCartItem calls API and refreshes cart', async () => {
    ordersAPI.updateCartItem.mockResolvedValue({ data: {} });

    render(<TestComponent />);

    // Wait for component to be ready
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toBeInTheDocument();
    });

    const updateButton = screen.getByTestId('update-item');
    updateButton.click();

    await waitFor(() => {
      expect(ordersAPI.updateCartItem).toHaveBeenCalledWith(1, 3);
    }, { timeout: 3000 });

    expect(ordersAPI.getCart).toHaveBeenCalled();
  });

  test('removeFromCart calls API and refreshes cart', async () => {
    ordersAPI.removeFromCart.mockResolvedValue({ data: {} });

    render(<TestComponent />);

    // Wait for component to be ready
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toBeInTheDocument();
    });

    const removeButton = screen.getByTestId('remove-item');
    removeButton.click();

    await waitFor(() => {
      expect(ordersAPI.removeFromCart).toHaveBeenCalledWith(1);
    }, { timeout: 3000 });

    expect(ordersAPI.getCart).toHaveBeenCalled();
  });

  test('moveToWishlist calls API and refreshes cart', async () => {
    ordersAPI.moveToWishlist.mockResolvedValue({ data: {} });

    render(<TestComponent />);

    // Wait for component to be ready
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toBeInTheDocument();
    });

    const moveButton = screen.getByTestId('move-to-wishlist');
    moveButton.click();

    await waitFor(() => {
      expect(ordersAPI.moveToWishlist).toHaveBeenCalledWith(1);
    }, { timeout: 3000 });

    expect(ordersAPI.getCart).toHaveBeenCalled();
  });
});
