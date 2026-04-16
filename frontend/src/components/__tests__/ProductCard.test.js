import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../ProductCard';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      if (typeof options === 'string') return options;
      if (!options || typeof options !== 'object') return key;
      if (options.defaultValue) {
        return options.defaultValue
          .replace('{{percent}}', options.percent ?? '')
          .replace('{{count}}', options.count ?? '');
      }
      return key;
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
    const onQuickView = jest.fn();
    render(
      <MemoryRouter>
        <ProductCard
          product={baseProduct}
          onAddToCart={jest.fn()}
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

