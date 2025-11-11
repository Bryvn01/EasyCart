import React from 'react';
import { render, screen } from '../test-utils';
import ProductListErrorUI from '../components/ProductListErrorUI';

describe('ProductListErrorUI', () => {
  it('renders error UI with i18n keys', () => {
    render(
      <ProductListErrorUI error={{ message: 'Network error' }} t={k => k} onRetry={() => {}} />
    );
    expect(screen.getByText(/errorLoadingProducts/i)).toBeInTheDocument();
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tryAgain/i })).toBeInTheDocument();
  });

  it('renders fallback error message if no error provided', () => {
    render(
      <ProductListErrorUI t={k => k} onRetry={() => {}} />
    );
    expect(screen.getByText(/unknownError/i)).toBeInTheDocument();
  });
});
