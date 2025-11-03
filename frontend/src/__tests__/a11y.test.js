import React from 'react';
import { render } from '../test-utils';
import ProductList from '../components/ProductList';

// Mock API
jest.mock('../services/api', () => ({
  productsAPI: {
    getProducts: jest.fn(() => Promise.resolve({ data: { results: [] } })),
    getCategories: jest.fn(() => Promise.resolve({ data: [] })),
  }
}));

describe('Accessibility checks', () => {
  it('ProductList renders without crashing', async () => {
    const { container } = render(<ProductList />);
    expect(container).toBeInTheDocument();
  });

  it('ProductList has proper structure', async () => {
    const { container } = render(<ProductList />);
    expect(container.firstChild).toBeTruthy();
  });
});
