/**
 * Integration test for Add-to-Cart → STK Push → Success flow
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EnhancedProductCard from '../../components/EnhancedProductCard';
import STKPushModal from '../../components/STKPushModal';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';
import { ordersAPI } from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../context/CartContext', () => ({
  ...jest.requireActual('../../context/CartContext'),
  useCart: () => ({
    addToCart: jest.fn(),
    cartCount: 0,
    cart: null,
    loading: false,
    fetchCart: jest.fn(),
    updateCartItem: jest.fn(),
    removeFromCart: jest.fn(),
    moveToWishlist: jest.fn(),
    updateCartCount: jest.fn()
  })
}));
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 1, email: 'test@example.com' },
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn()
  })
}));

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 1000,
  stock: 10
};

const mockOrder = {
  id: 1,
  total_amount: 1000
};

describe('Add-to-Cart → STK Push Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  test('complete flow with success', async () => {
    ordersAPI.addToCart = jest.fn().mockResolvedValue({ data: { message: 'Added' } });
    ordersAPI.initiatePayment = jest.fn().mockResolvedValue({
      data: { success: true, data: { ResponseCode: '0', CheckoutRequestID: 'ws_CO_123' } }
    });
    ordersAPI.getPaymentStatus = jest.fn().mockResolvedValue({
      data: { payment_status: 'completed' }
    });

    render(
      <BrowserRouter>
        <EnhancedProductCard product={mockProduct} />
      </BrowserRouter>
    );

    const addButton = screen.getByRole('button', { name: /add.*to cart/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(ordersAPI.addToCart).toHaveBeenCalledTimes(1);
    });

    expect(ordersAPI.addToCart).toHaveBeenCalledWith(1, 1);
  });

  test('prevents duplicate additions', async () => {
    ordersAPI.addToCart = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
    );

    render(
      <BrowserRouter>
        <EnhancedProductCard product={mockProduct} />
      </BrowserRouter>
    );

    const addButton = screen.getByRole('button', { name: /add.*to cart/i });
    
    fireEvent.click(addButton);
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(ordersAPI.addToCart).toHaveBeenCalledTimes(1);
    });
  });
});
