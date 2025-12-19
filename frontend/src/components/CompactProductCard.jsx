import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import OptimizedImage from './OptimizedImage';
import './CompactProductCard.css';

/**
 * Compact Product Card - Optimized for displaying 100+ products on mobile
 *
 * Features:
 * - Space-efficient layout
 * - Clear visual hierarchy
 * - Quick add-to-cart
 * - Essential info only
 * - Touch-optimized (44px+ targets)
 * - Memoized to prevent unnecessary re-renders
 */
const CompactProductCard = memo(({ product, onAddToCart, priority = false, getProductImageUrl }) => {

  // Handle add to cart with event stop propagation
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart && product.stock > 0) {
      onAddToCart(product);
    }
  };

  // Calculate discount percentage
  const discountPercent = product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price)
    ? Math.round(((parseFloat(product.compare_price) - parseFloat(product.price)) / parseFloat(product.compare_price)) * 100)
    : 0;

  return (
    <div className="compact-product-card">
      {/* Product Image with Link */}
      <Link to={`/products/${product.id}`} className="compact-product-image-link">
        <div className="compact-product-image-wrapper">
          {product.image ? (
            <OptimizedImage
              src={getProductImageUrl ? getProductImageUrl(product, '/placeholder.png') : (product.image || '/placeholder.png')}
              alt={product.name}
              width={300}
              height={300}
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="compact-product-image"
            />
          ) : (
            <div className="compact-product-placeholder">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Status Badge - Top Right */}
          {product.stock === 0 ? (
            <span className="compact-badge compact-badge-out-of-stock">Sold Out</span>
          ) : product.stock > 0 && product.stock <= 3 ? (
            <span className="compact-badge compact-badge-low-stock">{product.stock} left</span>
          ) : null}

          {/* Discount Badge - Top Left */}
          {discountPercent > 0 && (
            <span className="compact-badge compact-badge-discount">-{discountPercent}%</span>
          )}
        </div>
      </Link>

      {/* Product Info - Compact */}
      <div className="compact-product-info">
        {/* Product Name - 2 lines max */}
        <Link to={`/products/${product.id}`} className="compact-product-name-link">
          <h3 className="compact-product-name" title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Rating (if available) - Compact */}
        {product.rating && product.rating > 0 && (
          <div className="compact-product-rating">
            <div className="compact-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`compact-star ${star <= Math.floor(product.rating) ? 'compact-star-filled' : ''}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="compact-rating-count">({product.review_count || product.rating})</span>
          </div>
        )}

        {/* Price Section - Prominent */}
        <div className="compact-product-price-section">
          <div className="compact-price-wrapper">
            <span className="compact-price">
              KSh {parseFloat(product.price).toLocaleString()}
            </span>
            {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
              <span className="compact-price-old">
                KSh {parseFloat(product.compare_price).toLocaleString()}
              </span>
            )}
          </div>

          {/* Quick Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`compact-cart-btn ${product.stock === 0 ? 'compact-cart-btn-disabled' : ''}`}
            aria-label={product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            title={product.stock === 0 ? 'Out of stock' : 'Add to cart'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if product ID or stock changed
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.stock === nextProps.product.stock;
});

CompactProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    compare_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stock: PropTypes.number,
    rating: PropTypes.number,
    review_count: PropTypes.number,
  }).isRequired,
  onAddToCart: PropTypes.func,
  priority: PropTypes.bool,
  getProductImageUrl: PropTypes.func,
};

export default CompactProductCard;
