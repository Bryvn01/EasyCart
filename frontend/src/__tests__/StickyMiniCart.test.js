/**
 * StickyMiniCart Component Tests
 * 
 * Tests for the enhanced sticky mini-cart including:
 * - Visibility based on cart state
 * - Loading state display
 * - Error state display and dismissal
 * - Accessibility features
 * - Keyboard navigation
 * - Screen reader announcements
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import StickyMiniCart from '../components/StickyMiniCart';
import { useCart } from '../context/CartContext';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock CartContext
jest.mock('../context/CartContext');

describe('StickyMiniCart Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Visibility', () => {
    test('does not render when cart is empty', () => {
      useCart.mockReturnValue({
        cartCount: 0,
        cart: null,
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      const { container } = render(<StickyMiniCart />);
      expect(container.firstChild).toBeNull();
    });

    test('renders when cart has items', () => {
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    test('displays correct item count', () => {
      useCart.mockReturnValue({
        cartCount: 5,
        cart: { total_price: 2500, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      expect(screen.getByText('5 items')).toBeInTheDocument();
    });

    test('uses singular "item" for count of 1', () => {
      useCart.mockReturnValue({
        cartCount: 1,
        cart: { total_price: 500, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      expect(screen.getByText('1 item')).toBeInTheDocument();
    });

    test('displays 99+ for cart count over 99', () => {
      useCart.mockReturnValue({
        cartCount: 150,
        cart: { total_price: 75000, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      expect(screen.getByText('99+')).toBeInTheDocument();
      expect(screen.getByText('150 items')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    test('shows loading spinner when loading', () => {
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: true,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('loading');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    test('hides loading spinner when not loading', () => {
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('loading');
      expect(button).toHaveAttribute('aria-busy', 'false');
    });
  });

  describe('Error State', () => {
    test('displays error message when error exists', () => {
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: false,
        error: { message: 'Failed to update cart', code: 'UPDATE_ERROR' },
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to update cart')).toBeInTheDocument();
    });

    test('error dismiss button calls clearError', () => {
      const mockClearError = jest.fn();
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: false,
        error: { message: 'Test error', code: 'TEST_ERROR' },
        clearError: mockClearError,
      });

      render(<StickyMiniCart />);
      const dismissButton = screen.getByLabelText('Dismiss error');
      fireEvent.click(dismissButton);

      expect(mockClearError).toHaveBeenCalledTimes(1);
    });

    test('does not show error when error is null', () => {
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    test('navigates to cart page on button click', () => {
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      const button = screen.getByRole('button', { name: /view shopping cart/i });
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/cart');
    });

    test('navigates to cart on Enter key press', () => {
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      const button = screen.getByRole('button', { name: /view shopping cart/i });
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(mockNavigate).toHaveBeenCalledWith('/cart');
    });

    test('navigates to cart on Space key press', () => {
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      const button = screen.getByRole('button', { name: /view shopping cart/i });
      fireEvent.keyDown(button, { key: ' ' });

      expect(mockNavigate).toHaveBeenCalledWith('/cart');
    });

    test('clears error on Escape key press when error exists', () => {
      const mockClearError = jest.fn();
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: false,
        error: { message: 'Test error', code: 'TEST_ERROR' },
        clearError: mockClearError,
      });

      render(<StickyMiniCart />);
      const button = screen.getByRole('button', { name: /view shopping cart/i });
      fireEvent.keyDown(button, { key: 'Escape' });

      expect(mockClearError).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has correct ARIA labels', () => {
      useCart.mockReturnValue({
        cartCount: 3,
        cart: { total_price: 1500, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-label');
      expect(button.getAttribute('aria-label')).toContain('3 items');
    });

    test('has complementary landmark role', () => {
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    test('error has alert role for screen readers', () => {
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: false,
        error: { message: 'Test error', code: 'TEST_ERROR' },
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    test('has screen reader announcement region', () => {
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
      expect(statusRegion).toHaveAttribute('aria-atomic', 'true');
    });

    test('decorative elements have aria-hidden', () => {
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      const { container } = render(<StickyMiniCart />);
      const cartIcon = container.querySelector('.cart-icon');
      expect(cartIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Price Display', () => {
    test('displays formatted total price', () => {
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1234.56, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      // formatPriceLocale should format this properly
      expect(screen.getByText(/KSh/i)).toBeInTheDocument();
    });

    test('handles zero price', () => {
      useCart.mockReturnValue({
        cartCount: 1,
        cart: { total_price: 0, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      expect(screen.getByText(/KSh/i)).toBeInTheDocument();
    });

    test('handles missing total_price gracefully', () => {
      useCart.mockReturnValue({
        cartCount: 1,
        cart: { items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      // Should default to 0
      expect(screen.getByText(/KSh/i)).toBeInTheDocument();
    });
  });

  describe('Animation and Visibility Classes', () => {
    test('applies visible class when cart has items', async () => {
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      
      // Wait for animation delay
      await waitFor(() => {
        const container = screen.getByRole('complementary');
        expect(container).toHaveClass('visible');
      }, { timeout: 200 });
    });

    test('applies error class when error exists', () => {
      useCart.mockReturnValue({
        cartCount: 2,
        cart: { total_price: 1000, items: [] },
        loading: false,
        error: { message: 'Test error', code: 'TEST_ERROR' },
        clearError: jest.fn(),
      });

      render(<StickyMiniCart />);
      const container = screen.getByRole('complementary');
      expect(container).toHaveClass('has-error');
    });
  });
});
