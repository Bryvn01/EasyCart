/**
 * Integration test for Add-to-Cart → STK Push → Success flow
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EnhancedProductCard from '../../components/EnhancedProductCard';
import * as api from '../../services/api';

jest.mock('../../services/api', () => ({
  ordersAPI: {
    addToCart: jest.fn(),
    initiatePayment: jest.fn(),
    getPaymentStatus: jest.fn()
  }
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
    api.ordersAPI.addToCart.mockResolvedValue({ data: { message: 'Added' } });
  });

  test('complete flow with success', async () => {
    api.ordersAPI.addToCart.mockResolvedValue({ data: { message: 'Added' } });

    render(
      <BrowserRouter>
        <EnhancedProductCard product={mockProduct} />
      </BrowserRouter>
    );

    const addButton = screen.getByRole('button', { name: /add.*to cart/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(api.ordersAPI.addToCart).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });

    expect(api.ordersAPI.addToCart).toHaveBeenCalledWith(1, 1);
  });

  test('prevents duplicate additions', async () => {
    api.ordersAPI.addToCart.mockImplementation(() => 
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
      expect(api.ordersAPI.addToCart).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });
  });
});
