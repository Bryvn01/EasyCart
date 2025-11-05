import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { renderWithProviders } from './test-utils';
import ProductList from '../components/ProductList';
import Homepage from '../components/Homepage';
import axios from 'axios';

jest.mock('axios');

expect.extend(toHaveNoViolations);

describe('Accessibility (a11y) checks', () => {
  beforeEach(() => {
    // Mock axios.get for CategoryList component
    axios.get.mockResolvedValue({
      data: {
        results: [
          { id: 1, name: 'Electronics' },
          { id: 2, name: 'Fashion' }
        ]
      }
    });
  });

  it('ProductList should have no a11y violations', async () => {
    const { container } = renderWithProviders(<ProductList />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Homepage should have no a11y violations', async () => {
    const { container } = renderWithProviders(<Homepage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
