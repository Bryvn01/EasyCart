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

    // ✅ Use the actual aria-label value
    fireEvent.click(screen.getByRole('button', { name: "Add Test Product to cart" }));

    // ✅ Wait for button to disappear using the same query
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: "Add Test Product to cart" })).not.toBeInTheDocument(),
      { timeout: 1000 }
    );

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

    // ✅ Use the actual aria-label value consistently
    fireEvent.click(screen.getByRole('button', { name: "Add Test Product to cart" }));

    // ✅ Button should still be present after error
    const button = screen.getByRole('button', { name: "Add Test Product to cart" });
    expect(button).toBeInTheDocument();
    expect(screen.queryByText(/added to cart/i)).not.toBeInTheDocument();
  });
});
