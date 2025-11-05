import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { renderWithProviders } from './test-utils';
import { waitFor } from '@testing-library/react';
import ProductList from '../components/ProductList';
import Homepage from '../components/Homepage';

expect.extend(toHaveNoViolations);

describe('Accessibility (a11y) checks', () => {
  it('ProductList should have no a11y violations', async () => {
    const { container } = renderWithProviders(<ProductList />);
    
    // Wait for async rendering to complete
    await waitFor(() => {
      expect(container.querySelector('article, div')).toBeInTheDocument();
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Homepage should have no a11y violations', async () => {
    const { container } = renderWithProviders(<Homepage />);
    
    // Wait for async rendering to complete
    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
