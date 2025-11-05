import React, { useRef, useState } from 'react';
import { useFadeOutOnSuccess } from '../../hooks/useFadeOutOnSuccess';
import { motion } from 'framer-motion';
import { getProductImageUrl } from '../../utils/imageUtils';


const ProductCard = ({ product, onAddToCart, onQuickView, onToggleWishlist, isInWishlist = false }) => {
  const [addToCartBtnRef, addToCartBtnHidden, triggerAddToCartFadeOut] = useFadeOutOnSuccess();
  const successMsgRef = useRef(null);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.03, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
      className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden group flex flex-col min-h-[340px] sm:min-h-[360px] md:min-h-[380px] cursor-pointer transition-all duration-200"
      tabIndex={0}
      aria-label={product.name}
      onClick={e => {
        if (e.target.tagName !== 'BUTTON' && typeof onQuickView === 'function') onQuickView();
      }}
    >
      <div className="relative w-full aspect-[1/1] overflow-hidden rounded-t-lg min-h-[160px] sm:min-h-[180px] md:min-h-[200px]">
        <img
          src={getProductImageUrl(product, '/placeholder.png')}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-200"
          loading="lazy"
          crossOrigin="anonymous"
        />
        {product.is_flash_sale && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded shadow-lg animate-pulse">🔥 Hot Deal</span>
        )}
        {product.is_top_seller && !product.is_flash_sale && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold px-2 py-1 rounded shadow-lg">⭐ Bestseller</span>
        )}
        {product.is_new && (
          <span className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-teal-400 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">✨ New</span>
        )}
        {product.old_price && product.price < product.old_price && (
          <span className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-cyan-400 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
            -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col p-3">
        <div className="text-sm text-gray-500 mb-1">{product.category?.name || product.category_name || 'Uncategorized'}</div>
        <h3 className="font-semibold text-base mb-1 truncate" title={product.name}>{product.name}</h3>
        <div className="text-xs text-gray-400 mb-1">{product.brand}</div>

        {/* Star Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-xs text-gray-600 ml-1">({product.rating})</span>
          </div>
        )}

        {/* Stock Indicator */}
        {product.stock !== undefined && (
          <div className="mb-2">
            {product.stock > 10 ? (
              <span className="text-xs text-green-600 font-medium">✓ In Stock</span>
            ) : product.stock > 0 ? (
              <span className="text-xs text-orange-600 font-medium">⚠ Only {product.stock} left</span>
            ) : (
              <span className="text-xs text-red-600 font-medium">✗ Out of Stock</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-primary">KSh {product.price?.toLocaleString()}</span>
          {product.old_price && product.price < product.old_price && (
            <span className="text-xs line-through text-gray-400">KSh {product.old_price?.toLocaleString()}</span>
          )}
        </div>
        {/* Trust badges beside info */}
        {product.trust_badges && (
          <div className="flex gap-2 mb-2">
            {product.trust_badges.map(badge => (
              <span key={badge} className="bg-gradient-to-r from-gray-100 to-gray-200 text-xs text-gray-700 px-2 py-1 rounded border border-gray-200 font-medium shadow">{badge}</span>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-auto">
          <button
            ref={addToCartBtnRef}
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded transition w-full opacity-100 group-hover:scale-105 group-hover:shadow-lg focus:opacity-100"
            style={{ transition: 'opacity 0.4s', opacity: addToCartBtnHidden ? 0 : 1, display: addToCartBtnHidden ? 'none' : undefined }}
            onClick={async e => {
              e.stopPropagation();
              try {
                await onAddToCart(product);
                triggerAddToCartFadeOut(() => {
                  setAddToCartSuccess(true);
                  setTimeout(() => {
                    if (successMsgRef.current) successMsgRef.current.focus();
                  }, 10);
                });
              } catch (err) {
                // Don't hide the button on failure; parent should handle UI feedback
                console.error('Add to cart failed', err);
              }
            }}
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </button>
          {addToCartSuccess && (
            <div
              ref={successMsgRef}
              tabIndex={-1}
              aria-live="polite"
              style={{
                marginTop: '0.5rem',
                background: 'var(--success, #22c55e)',
                color: 'white',
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              Added to cart!
            </div>
          )}
          <button
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded transition w-full opacity-100 group-hover:scale-105 group-hover:shadow focus:opacity-100"
            onClick={e => { e.stopPropagation(); if (typeof onQuickView === 'function') onQuickView(); }}
            aria-label={`Quick view ${product.name}`}
          >
            Quick View
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
