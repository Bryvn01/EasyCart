import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test-utils';
import ProductCard from '../ProductCard';

describe('ProductCard', () => {
  const product = {
    id: 1,
    name: 'Test Product',
    price: 100,
    brand: 'Brand',
    category: { name: 'Category' },
  };

  it('renders product information', () => {
    render(
      <ProductCard
        product={product}
        onAddToCart={async () => true}
      />
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('calls onAddToCart when add button is clicked', async () => {
    const mockAddToCart = jest.fn().mockResolvedValue(true);
    
    render(
      <ProductCard
        product={product}
        onAddToCart={mockAddToCart}
      />
    );
    
    const addButton = screen.getByLabelText('Add Test Product to cart');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalled();
    });
  });

  it('handles add to cart errors', async () => {
    const mockAddToCart = jest.fn().mockRejectedValue(new Error('fail'));
    
    render(
      <ProductCard
        product={product}
        onAddToCart={mockAddToCart}
      />
    );
    
    const addButton = screen.getByLabelText('Add Test Product to cart');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalled();
    });
    
    // Button should still be present after error
    expect(screen.getByLabelText('Add Test Product to cart')).toBeInTheDocument();
  });
});
