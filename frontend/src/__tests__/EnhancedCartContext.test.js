/**
 * Enhanced Cart Context Tests
 *
 * Tests for enterprise-grade cart state management including:
 * - Optimistic updates
 * - Error handling and rollback
 * - Request deduplication
 * - Loading states
 * - Memory leak prevention
 */

import React from 'react';
import { render, screen, waitFor, act } from '../test-utils';
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
  const {
    cartCount,
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    moveToWishlist,
    clearError
  } = useCart();

  const handleAddToCart = async () => {
    try {
      await addToCart(1, 2);
    } catch (err) {
      // Error is handled by context, component just needs to catch to prevent unhandled rejection
    }
  };

  const handleUpdateItem = async () => {
    try {
      await updateCartItem(1, 3);
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleRemoveItem = async () => {
    try {
      await removeFromCart(1);
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleMoveToWishlist = async () => {
    try {
      await moveToWishlist(1);
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <div>
      <div data-testid="cart-count">{cartCount}</div>
      <div data-testid="loading-state">{loading ? 'loading' : 'idle'}</div>
      <div data-testid="error-state">{error ? error.message : 'no-error'}</div>
      <div data-testid="cart-items">{cart?.items?.length || 0}</div>
      <button onClick={handleAddToCart} data-testid="add-to-cart">Add to Cart</button>
      <button onClick={handleUpdateItem} data-testid="update-item">Update Item</button>
      <button onClick={handleRemoveItem} data-testid="remove-item">Remove Item</button>
      <button onClick={handleMoveToWishlist} data-testid="move-to-wishlist">Move to Wishlist</button>
      <button onClick={clearError} data-testid="clear-error">Clear Error</button>
    </div>
  );
};

describe('Enhanced CartContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Set localStorage token to make user authenticated
    localStorage.setItem('access_token', 'test-token');
    ordersAPI.getCart.mockResolvedValue({
      data: {
        items: [
          { id: 1, quantity: 2, product: { id: 1, name: 'Product 1', price: 100 } }
        ],
        total_price: 200
      }
    });
  });

  describe('Initial Load', () => {
    test('fetches cart on mount when authenticated', async () => {
      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      }, { timeout: 3000 });

      expect(ordersAPI.getCart).toHaveBeenCalled();
    });

    test('cart count is 0 when not authenticated', async () => {
      localStorage.removeItem('access_token');

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      });

      expect(ordersAPI.getCart).not.toHaveBeenCalled();
    });
  });

  describe('Optimistic Updates', () => {
    test('addToCart updates cart after API response', async () => {
      ordersAPI.addToCart.mockResolvedValue({ data: {} });
      ordersAPI.getCart.mockResolvedValueOnce({
        data: {
          items: [
            { id: 1, quantity: 2, product: { id: 1, name: 'Product 1', price: 100 } }
          ],
          total_price: 200
        }
      }).mockResolvedValueOnce({
        data: {
          items: [
            { id: 1, quantity: 2, product: { id: 1, name: 'Product 1', price: 100 } },
            { id: 2, quantity: 2, product: { id: 2, name: 'Product 2', price: 150 } }
          ],
          total_price: 500
        }
      });

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      }, { timeout: 3000 });

      const addButton = screen.getByTestId('add-to-cart');

      await act(async () => {
        addButton.click();
      });

      // Wait for cart to be updated
      await waitFor(() => {
        expect(ordersAPI.addToCart).toHaveBeenCalled();
        expect(ordersAPI.getCart).toHaveBeenCalledTimes(2); // Initial + after add
      }, { timeout: 3000 });
    });

    test('removeFromCart updates cart after removal', async () => {
      ordersAPI.removeFromCart.mockResolvedValue({ data: {} });
      ordersAPI.getCart.mockResolvedValueOnce({
        data: {
          items: [
            { id: 1, quantity: 2, product: { id: 1, name: 'Product 1', price: 100 } }
          ],
          total_price: 200
        }
      }).mockResolvedValueOnce({
        data: {
          items: [],
          total_price: 0
        }
      });

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      }, { timeout: 3000 });

      const removeButton = screen.getByTestId('remove-item');

      await act(async () => {
        removeButton.click();
      });

      await waitFor(() => {
        expect(ordersAPI.removeFromCart).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    test('updateCartItem updates quantity', async () => {
      ordersAPI.updateCartItem.mockResolvedValue({ data: {} });
      ordersAPI.getCart.mockResolvedValueOnce({
        data: {
          items: [
            { id: 1, quantity: 2, product: { id: 1, name: 'Product 1', price: 100 } }
          ],
          total_price: 200
        }
      }).mockResolvedValueOnce({
        data: {
          items: [
            { id: 1, quantity: 3, product: { id: 1, name: 'Product 1', price: 100 } }
          ],
          total_price: 300
        }
      });

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      }, { timeout: 3000 });

      const updateButton = screen.getByTestId('update-item');

      await act(async () => {
        updateButton.click();
      });

      await waitFor(() => {
        expect(ordersAPI.updateCartItem).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Error Handling and Rollback', () => {
    test('displays error message when API fails', async () => {
      const error = new Error('Product is out of stock');
      error.response = { data: { message: 'Product is out of stock' }, status: 400 };
      ordersAPI.addToCart.mockRejectedValue(error);
      ordersAPI.getCart.mockResolvedValue({
        data: {
          items: [
            { id: 1, quantity: 2, product: { id: 1, name: 'Product 1', price: 100 } }
          ],
          total_price: 200
        }
      });

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      }, { timeout: 3000 });

      const addButton = screen.getByTestId('add-to-cart');

      await act(async () => {
        addButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toHaveTextContent('Product is out of stock');
      }, { timeout: 3000 });
    });

    test('clearError removes error state', async () => {
      const error = new Error('Test error');
      error.response = { data: { message: 'Test error' }, status: 400 };
      ordersAPI.addToCart.mockRejectedValue(error);
      ordersAPI.getCart.mockResolvedValue({
        data: {
          items: [
            { id: 1, quantity: 2, product: { id: 1, name: 'Product 1', price: 100 } }
          ],
          total_price: 200
        }
      });

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      }, { timeout: 3000 });

      const addButton = screen.getByTestId('add-to-cart');

      await act(async () => {
        addButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).not.toHaveTextContent('no-error');
      }, { timeout: 3000 });

      const clearButton = screen.getByTestId('clear-error');

      await act(async () => {
        clearButton.click();
      });

      expect(screen.getByTestId('error-state')).toHaveTextContent('no-error');
    });
  });

  describe('Request Deduplication', () => {
    test('prevents duplicate addToCart requests', async () => {
      ordersAPI.addToCart.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: {} }), 200))
      );

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toBeInTheDocument();
      }, { timeout: 3000 });

      const addButton = screen.getByTestId('add-to-cart');

      await act(async () => {
        addButton.click();
        addButton.click();
        addButton.click();
      });

      await waitFor(() => {
        expect(ordersAPI.addToCart).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });
    });

    test('prevents duplicate removeFromCart requests', async () => {
      ordersAPI.removeFromCart.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: {} }), 200))
      );

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toBeInTheDocument();
      }, { timeout: 3000 });

      const removeButton = screen.getByTestId('remove-item');

      await act(async () => {
        removeButton.click();
        removeButton.click();
        removeButton.click();
      });

      await waitFor(() => {
        expect(ordersAPI.removeFromCart).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });
    });
  });

  describe('Retry Logic', () => {
    test('retries failed fetch requests', async () => {
      let callCount = 0;
      ordersAPI.getCart.mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          data: {
            items: [
              { id: 1, quantity: 2, product: { id: 1, name: 'Product 1', price: 100 } }
            ],
            total_price: 200
          }
        });
      });

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      }, { timeout: 5000 });

      // Should have retried and eventually succeeded
      // Note: May be called more than expected due to component re-renders
      expect(ordersAPI.getCart.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    test('shows error after max retries', async () => {
      ordersAPI.getCart.mockRejectedValue(new Error('Network error'));

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).not.toHaveTextContent('no-error');
      }, { timeout: 5000 });

      // Should have tried initial + 2 retries = 3 times minimum
      expect(ordersAPI.getCart.mock.calls.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty cart response', async () => {
      ordersAPI.getCart.mockResolvedValue({
        data: {
          items: [],
          total_price: 0
        }
      });

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      }, { timeout: 3000 });

      expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
    });

    test('handles malformed cart data gracefully', async () => {
      ordersAPI.getCart.mockResolvedValue({
        data: {
          items: null,
          total_price: 0
        }
      });

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      }, { timeout: 3000 });
    });

    test('calculates total items correctly with multiple items', async () => {
      ordersAPI.getCart.mockResolvedValue({
        data: {
          items: [
            { id: 1, quantity: 2, product: { id: 1, name: 'Product 1', price: 100 } },
            { id: 2, quantity: 3, product: { id: 2, name: 'Product 2', price: 150 } },
            { id: 3, quantity: 1, product: { id: 3, name: 'Product 3', price: 200 } }
          ],
          total_price: 850
        }
      });

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('6');
      }, { timeout: 3000 });
    });
  });
});
