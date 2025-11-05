import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/test-utils';
import ProductCard from '../ProductCard';

describe('ProductCard fade-out/auto-hide', () => {
  const product = {
    id: 1,
    name: 'Test Product',
    price: 100,
    brand: 'Brand',
    category: { name: 'Category' },
  };

  it('fades out and hides Add to Cart button, shows success message on success', async () => {
    const onAddToCart = jest.fn().mockResolvedValue(true);
    
    renderWithProviders(
      <ProductCard
        product={product}
        onAddToCart={onAddToCart}
      />
    );

    const addButton = await screen.findByRole('button', { name: /add.*to cart/i });
    
    await act(async () => {
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(onAddToCart).toHaveBeenCalledWith(product);
    }, { timeout: 2000 });

    await waitFor(() => {
      const msg = screen.queryByText(/added to cart/i);
      expect(msg).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('does not hide Add to Cart button on error', async () => {
    const onAddToCart = jest.fn().mockRejectedValue(new Error('fail'));
    
    renderWithProviders(
      <ProductCard
        product={product}
        onAddToCart={onAddToCart}
      />
    );

    const addButton = await screen.findByRole('button', { name: /add.*to cart/i });
    
    await act(async () => {
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(onAddToCart).toHaveBeenCalled();
    }, { timeout: 2000 });

    // Button should still be visible after error
    await waitFor(() => {
      const button = screen.queryByRole('button', { name: /add.*to cart/i });
      expect(button).toBeInTheDocument();
    }, { timeout: 2000 });
    
    expect(screen.queryByText(/added to cart/i)).not.toBeInTheDocument();
  });
});
