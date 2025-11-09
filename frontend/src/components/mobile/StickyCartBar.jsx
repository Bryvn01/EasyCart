import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/**
 * Sticky "Add to Cart" bar that appears on mobile when product details scroll out of view
 * Uses Intersection Observer for performance-optimized visibility detection
 * Respects iOS safe area insets for proper spacing on notched devices
 * 
 * @param {Object} product - Product object with id, name, price, image, stock
 * @param {Function} onAddToCart - Callback when add to cart button is clicked
 * @param {boolean} isAdding - Whether add to cart is in progress
 */
const StickyCartBar = ({ product, onAddToCart, isAdding = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (!isMobile) {
      setIsVisible(false);
      return;
    }

    // Find the trigger element (product header/details section)
    const triggerElement = document.querySelector('[data-sticky-trigger]');
    
    if (!triggerElement) {
      return;
    }

    // Create Intersection Observer
    const observerOptions = {
      threshold: 0,
      rootMargin: '-100px 0px 0px 0px' // Trigger when element is 100px from top
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when trigger element is NOT visible
        setIsVisible(!entry.isIntersecting);
      },
      observerOptions
    );

    observer.observe(triggerElement);

    return () => {
      observer.disconnect();
    };
  }, [isMobile]);

  // Don't render if not mobile or product unavailable
  if (!isMobile || !product) {
    return null;
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div
      className="sticky-cart-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid var(--gray-200)',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: 'var(--z-sticky)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
        paddingTop: '12px',
        paddingLeft: '16px',
        paddingRight: '16px',
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform'
      }}
      role="complementary"
      aria-label="Product quick add"
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '100%'
      }}>
        {/* Product Thumbnail */}
        {product.image && (
          <div style={{
            width: '48px',
            height: '48px',
            flexShrink: 0,
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'var(--gray-100)'
          }}>
            <img
              src={product.thumbnail_url || product.image}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              loading="lazy"
            />
          </div>
        )}

        {/* Product Info */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--gray-900)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {product.name}
          </div>
          <div style={{
            fontSize: '1rem',
            fontWeight: '700',
            color: 'var(--primary-600)'
          }}>
            KSh {parseFloat(product.price).toLocaleString()}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => !isAdding && !isOutOfStock && onAddToCart(product)}
          disabled={isAdding || isOutOfStock}
          className="btn btn-primary"
          style={{
            flexShrink: 0,
            padding: '12px 20px',
            fontSize: '0.875rem',
            fontWeight: '600',
            minHeight: '44px',
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: (isAdding || isOutOfStock) ? 0.5 : 1,
            cursor: (isAdding || isOutOfStock) ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 200ms'
          }}
          aria-label={isOutOfStock ? 'Out of stock' : 'Add to cart'}
        >
          {isAdding ? (
            <>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <span>Adding...</span>
            </>
          ) : isOutOfStock ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Out of Stock</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

StickyCartBar.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    image: PropTypes.string,
    thumbnail_url: PropTypes.string,
    stock: PropTypes.number
  }),
  onAddToCart: PropTypes.func.isRequired,
  isAdding: PropTypes.bool
};

export default StickyCartBar;
