import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiMessageCircle } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import CartBadge from './ui/CartBadge';

/**
 * MobileHeader - Instagram-inspired mobile header
 * Features:
 * - Prominent branding (like Instagram logo)
 * - Quick access icons (like Instagram's header)
 * - Sticky positioning with safe area support
 * - Clean, minimal design
 */
const MobileHeader = () => {
  const { cartCount } = useCart();

  return (
    <header
      className="mobile-header"
      role="banner"
    >
      <div className="mobile-header__container">
        {/* Left: Logo/Brand */}
        <Link to="/" className="mobile-header__brand">
          <FiShoppingCart className="mobile-header__brand-icon" />
          <span className="mobile-header__brand-text">EasyCart</span>
        </Link>

        {/* Right: Action Icons */}
        <div className="mobile-header__actions">
          <Link
            to="/wishlist"
            className="mobile-header__action-btn"
            aria-label="View wishlist"
          >
            <FiHeart className="mobile-header__icon" />
          </Link>

          <Link
            to="/cart"
            className="mobile-header__action-btn mobile-header__cart-btn"
            aria-label={`View cart, ${cartCount} items`}
          >
            <FiShoppingCart className="mobile-header__icon" />
            {cartCount > 0 && (
              <CartBadge count={cartCount} className="mobile-header__badge" />
            )}
          </Link>

          <Link
            to="/messages"
            className="mobile-header__action-btn"
            aria-label="View messages"
          >
            <FiMessageCircle className="mobile-header__icon" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
