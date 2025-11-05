import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test-utils';
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
    render(
      <ProductCard
        product={product}
        onAddToCart={async () => true}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    await waitFor(() => expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument(), { timeout: 1000 });
    const msg = await screen.findByText(/added to cart/i);
    expect(msg).toBeInTheDocument();
    expect(document.activeElement).toBe(msg);
  });

  it('does not hide Add to Cart button on error', async () => {
    render(
      <ProductCard
        product={product}
        onAddToCart={async () => { throw new Error('fail'); }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument());
    expect(screen.queryByText(/added to cart/i)).not.toBeInTheDocument();
  });
});
