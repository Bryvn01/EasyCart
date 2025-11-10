import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPriceLocale } from '../utils/formatPrice';
import './StickyMiniCart.css';

/**
 * StickyMiniCart - Enterprise-grade mobile cart summary bar
 *
 * Features:
 * - Real-time cart count and total display
 * - Loading and error state handling
 * - WCAG AA accessibility compliance
 * - Smooth animations and transitions
 * - Keyboard navigation support
 * - Screen reader announcements
 *
 * @returns {JSX.Element|null} Sticky cart bar or null if no items
 */
const StickyMiniCart = () => {
  const { cartCount, cart, loading, error, clearError } = useCart();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const announcementRef = useRef(null);
  const prevCountRef = useRef(0);

  // Show/hide with animation based on cart count
  useEffect(() => {
    if (cartCount > 0) {
      // Small delay to trigger animation
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [cartCount]);

  // Announce cart changes to screen readers
  useEffect(() => {
    if (cartCount !== prevCountRef.current && cartCount > 0) {
      const change = cartCount - prevCountRef.current;
      const announcement = change > 0
        ? `${Math.abs(change)} item${Math.abs(change) !== 1 ? 's' : ''} added to cart. Total: ${cartCount} item${cartCount !== 1 ? 's' : ''}`
        : `Item removed from cart. Total: ${cartCount} item${cartCount !== 1 ? 's' : ''}`;

      if (announcementRef.current) {
        announcementRef.current.textContent = announcement;
      }

      prevCountRef.current = cartCount;
    }
  }, [cartCount]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate('/cart');
    } else if (e.key === 'Escape' && error) {
      e.preventDefault();
      clearError();
    }
  };

  // Don't render if no items in cart
  if (!cartCount || cartCount === 0) return null;

  const totalPrice = cart?.total_price || 0;
  const itemText = cartCount === 1 ? 'item' : 'items';

  return (
    <>
      {/* Screen reader announcements - visually hidden */}
      <div
        ref={announcementRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <div
        className={`sticky-mini-cart ${isVisible ? 'visible' : ''} ${error ? 'has-error' : ''}`}
        role="complementary"
        aria-label="Shopping cart summary"
      >
        {/* Error notification */}
        {error && (
          <div
            className="mini-cart-error"
            role="alert"
            aria-live="assertive"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="error-message">{error.message}</span>
            <button
              className="error-dismiss"
              onClick={clearError}
              aria-label="Dismiss error"
              type="button"
            >
              ✕
            </button>
          </div>
        )}

        <button
          className={`sticky-mini-cart-button ${loading ? 'loading' : ''}`}
          onClick={() => navigate('/cart')}
          onKeyDown={handleKeyDown}
          aria-label={`View shopping cart with ${cartCount} ${itemText}, total ${formatPriceLocale(totalPrice)} Kenya Shillings`}
          aria-busy={loading}
          type="button"
        >
          {/* Loading indicator */}
          {loading && (
            <span className="loading-spinner" aria-hidden="true">
              <span className="spinner"></span>
            </span>
          )}

          {/* Cart icon with badge */}
          <span className="cart-icon" aria-hidden="true">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="cart-badge">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </span>

          {/* Cart information */}
          <span className="cart-info">
            <span className="cart-count">
              {cartCount} {itemText}
            </span>
            <span className="cart-total">
              KSh {formatPriceLocale(totalPrice)}
            </span>
          </span>

          {/* Arrow indicator */}
          <span className="cart-arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </>
  );
};

export default StickyMiniCart;
