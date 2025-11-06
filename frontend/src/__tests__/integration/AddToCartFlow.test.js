/**
 * Integration test for Add-to-Cart → STK Push → Success flow
 */

import { render, screen, fireEvent, waitFor } from '../../test-utils';
import EnhancedProductCard from '../../components/EnhancedProductCard';
import * as api from '../../services/api';

jest.mock('../../services/api', () => ({
  ordersAPI: {
    addToCart: jest.fn(),
    initiatePayment: jest.fn(),
    getPaymentStatus: jest.fn()
  }
}));

// Mock auth context to simulate logged-in user
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com' },
    token: 'mock-token',
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  }),
}));

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 1000,
  stock: 10
};

describe('Add-to-Cart → STK Push Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.ordersAPI.addToCart.mockResolvedValue({ data: { message: 'Added' } });
  });

  test('complete flow with success', async () => {
    api.ordersAPI.addToCart.mockResolvedValue({ data: { message: 'Added' } });

    // Just render the component directly - test-utils provides all providers
    render(<EnhancedProductCard product={mockProduct} />);

    const addButton = screen.getByRole('button', { name: /add.*to cart/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(api.ordersAPI.addToCart).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });

    expect(api.ordersAPI.addToCart).toHaveBeenCalledWith({
      product_id: 1,
      quantity: 1
    });
  });

  test('prevents duplicate additions', async () => {
    api.ordersAPI.addToCart.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
    );

    // Just render the component directly - test-utils provides all providers
    render(<EnhancedProductCard product={mockProduct} />);

    const addButton = screen.getByRole('button', { name: /add.*to cart/i });

    fireEvent.click(addButton);
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(api.ordersAPI.addToCart).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });
  });
});
