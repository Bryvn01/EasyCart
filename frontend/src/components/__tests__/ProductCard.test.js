import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../ProductCard';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      const textMap = {
        quickView: 'Quick View',
        addToCart: 'Add to Cart',
        outOfStock: 'Out of Stock'
      };
      if (!options || typeof options !== 'object') {
        return textMap[key] || key;
      }
      if (options.defaultValue) {
        return options.defaultValue
          .replace('{{percent}}', options.percent ?? '')
          .replace('{{count}}', options.count ?? '');
      }

      return textMap[key] || key;
    }
  })
}));

describe('ProductCard (catalog UI coverage)', () => {
  const baseProduct = {
    id: 1,
    name: 'Kenyan Coffee',
    description: 'Fresh roast',
    price: 1200,
    original_price: 1500,
    stock: 2,
    discount_percentage: 10,
    image: '/coffee.jpg',
    rating: 4.5,
    review_count: 12
  };

  test('renders priority image loading, low-stock and discount badges, and visible quick view', () => {
    const onAddToCart = jest.fn();
    const onQuickView = jest.fn();
    render(
      <MemoryRouter>
        <ProductCard
          product={baseProduct}
          onAddToCart={onAddToCart}
          onQuickView={onQuickView}
          priority={true}
        />
      </MemoryRouter>
    );

    const image = screen.getByAltText('Kenyan Coffee product image');
    expect(image).toHaveAttribute('loading', 'eager');

    expect(screen.getByText('-10%')).toHaveClass('bg-gray-900');
    expect(screen.getByText('Only 2 left')).toHaveClass('bg-gray-700');

    const quickViewBtn = screen.getByRole('button', { name: 'Quick View' });
    expect(quickViewBtn).toBeInTheDocument();
    fireEvent.click(quickViewBtn);
    expect(onQuickView).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart - Kenyan Coffee' }));
    expect(onAddToCart).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  test('hides quick view and disables cart action when out of stock', () => {
    render(
      <MemoryRouter>
        <ProductCard
          product={{ ...baseProduct, stock: 0, discount_percentage: 0 }}
          onAddToCart={jest.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: 'Quick View' })).not.toBeInTheDocument();
    const actionButton = screen.getByRole('button', { name: 'Out of Stock' });
    expect(actionButton).toBeDisabled();
  });
});
