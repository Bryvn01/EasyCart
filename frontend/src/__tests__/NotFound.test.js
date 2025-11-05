import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../pages/NotFound';

describe('NotFound Component', () => {
  it('renders 404 heading', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders "Page Not Found" message', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('renders home link', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    const homeLink = screen.getByText('Go to Home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders products link', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    const productsLink = screen.getByText('Browse Products');
    expect(productsLink).toBeInTheDocument();
    expect(productsLink.closest('a')).toHaveAttribute('href', '/products');
  });
});
