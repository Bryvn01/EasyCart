import React from 'react';
import { render, screen } from '../test-utils';
import NotFound from '../pages/NotFound';

describe('NotFound Component', () => {
  it('renders 404 heading', () => {
    render(<NotFound />);

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders "Page Not Found" message', () => {
    render(<NotFound />);

    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('renders home link', () => {
    render(<NotFound />);

    const homeLink = screen.getByText('Go to Home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders products link', () => {
    render(<NotFound />);

    const productsLink = screen.getByText('Browse Products');
    expect(productsLink).toBeInTheDocument();
    expect(productsLink.closest('a')).toHaveAttribute('href', '/products');
  });
});
