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
    renderWithProviders(
      <ProductCard
        product={product}
        onAddToCart={async () => true}
      />
    );
    
    const addButton = await screen.findByRole('button', { name: /add.*test product.*to cart/i });
    
    await act(async () => {
      fireEvent.click(addButton);
    });
    
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /add.*test product.*to cart/i })).not.toBeInTheDocument();
    }, { timeout: 1000 });
    
    const msg = await screen.findByText(/added to cart/i);
    expect(msg).toBeInTheDocument();
  });

  it('does not hide Add to Cart button on error', async () => {
    renderWithProviders(
      <ProductCard
        product={product}
        onAddToCart={async () => { throw new Error('fail'); }}
      />
    );
    
    const addButton = await screen.findByRole('button', { name: /add.*test product.*to cart/i });
    
    await act(async () => {
      fireEvent.click(addButton);
    });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add.*test product.*to cart/i })).toBeInTheDocument();
    });
    
    expect(screen.queryByText(/added to cart/i)).not.toBeInTheDocument();
  });
});
