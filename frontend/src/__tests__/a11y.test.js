import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { renderWithProviders } from './test-utils';
import ProductList from '../components/ProductList';
import Homepage from '../components/Homepage';

expect.extend(toHaveNoViolations);

describe('Accessibility (a11y) checks', () => {
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
