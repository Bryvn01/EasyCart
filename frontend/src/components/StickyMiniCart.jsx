import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './StickyMiniCart.css';

const StickyMiniCart = () => {
  const { cartCount, cart } = useCart();
  const navigate = useNavigate();

  if (!cartCount || cartCount === 0) return null;

  const totalPrice = cart?.total_price || 0;

  return (
    <div className="sticky-mini-cart" role="complementary" aria-label="Shopping cart summary">
      <button
        className="sticky-mini-cart-button"
        onClick={() => navigate('/cart')}
        aria-label={`View cart with ${cartCount} items, total ${totalPrice} KSh`}
      >
        <span className="cart-icon" aria-hidden="true">
          🛒
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </span>
        <span className="cart-info">
          <span className="cart-count">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
          <span className="cart-total">KSh {parseFloat(totalPrice).toLocaleString()}</span>
        </span>
        <span className="cart-arrow" aria-hidden="true">→</span>
      </button>
    </div>
  );
};

export default StickyMiniCart;
