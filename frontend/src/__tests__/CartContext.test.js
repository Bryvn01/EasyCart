import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider, useCart } from '../context/CartContext';

// Mock the AuthContext
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: true,
    user: null,
    login: jest.fn(),
    logout: jest.fn()
  }))
}));

// Mock the API
jest.mock('../services/api', () => ({
  ordersAPI: {
    getCart: jest.fn(),
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateCartItem: jest.fn(),
    moveToWishlist: jest.fn(),
  }
}));

const { ordersAPI } = require('../services/api');
const { useAuth } = require('../context/AuthContext');

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

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <CartProvider>
        {component}
      </CartProvider>
    </BrowserRouter>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ordersAPI.getCart.mockResolvedValue({
      data: {
        items: [
          { id: 1, quantity: 2, product: { id: 1, name: 'Product 1', price: 100 } }
        ]
      }
    });
  });

  test('provides cart count when authenticated', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: null });
    
    const { getByTestId } = renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(getByTestId('cart-count')).toHaveTextContent('2');
    });
  });

  test('cart count is 0 when not authenticated', async () => {
    useAuth.mockReturnValue({ isAuthenticated: false, user: null });
    
    const { getByTestId } = renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(getByTestId('cart-count')).toHaveTextContent('0');
    });
  });

  test('addToCart calls API and refreshes cart', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: null });
    ordersAPI.addToCart.mockResolvedValue({ data: {} });
    
    const { getByTestId } = renderWithProviders(<TestComponent />);

    const addButton = getByTestId('add-to-cart');
    addButton.click();

    await waitFor(() => {
      expect(ordersAPI.addToCart).toHaveBeenCalledWith({ product_id: 1, quantity: 2 });
      expect(ordersAPI.getCart).toHaveBeenCalled();
    });
  });

  test('updateCartItem calls API and refreshes cart', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: null });
    ordersAPI.updateCartItem.mockResolvedValue({ data: {} });
    
    const { getByTestId } = renderWithProviders(<TestComponent />);

    const updateButton = getByTestId('update-item');
    updateButton.click();

    await waitFor(() => {
      expect(ordersAPI.updateCartItem).toHaveBeenCalledWith(1, 3);
      expect(ordersAPI.getCart).toHaveBeenCalled();
    });
  });

  test('removeFromCart calls API and refreshes cart', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: null });
    ordersAPI.removeFromCart.mockResolvedValue({ data: {} });
    
    const { getByTestId } = renderWithProviders(<TestComponent />);

    const removeButton = getByTestId('remove-item');
    removeButton.click();

    await waitFor(() => {
      expect(ordersAPI.removeFromCart).toHaveBeenCalledWith(1);
      expect(ordersAPI.getCart).toHaveBeenCalled();
    });
  });

  test('moveToWishlist calls API and refreshes cart', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: null });
    ordersAPI.moveToWishlist.mockResolvedValue({ data: {} });
    
    const { getByTestId } = renderWithProviders(<TestComponent />);

    const moveButton = getByTestId('move-to-wishlist');
    moveButton.click();

    await waitFor(() => {
      expect(ordersAPI.moveToWishlist).toHaveBeenCalledWith(1);
      expect(ordersAPI.getCart).toHaveBeenCalled();
    });
  });
});
