import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';

const ProductCard = memo(({ product, onAddToCart, onQuickView, onToggleWishlist, isInWishlist = false }) => {
  // Memoize event handlers to prevent unnecessary re-renders
  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    onAddToCart(product);
  }, [onAddToCart, product]);

  const handleQuickView = useCallback((e) => {
    e.stopPropagation();
    if (typeof onQuickView === 'function') onQuickView();
  }, [onQuickView]);

  const handleCardClick = useCallback((e) => {
    if (e.target.tagName !== 'BUTTON' && typeof onQuickView === 'function') {
      onQuickView();
    }
  }, [onQuickView]);

  // Calculate discount percentage once
  const discountPercentage = product.old_price && product.price < product.old_price 
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.03, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
      className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden group flex flex-col min-h-[340px] sm:min-h-[360px] md:min-h-[380px] cursor-pointer transition-all duration-200"
      tabIndex={0}
      aria-label={product.name}
      onClick={handleCardClick}
    >
      <div className="relative w-full aspect-[1/1] overflow-hidden rounded-t-lg min-h-[160px] sm:min-h-[180px] md:min-h-[200px]">
        <img
          src={product.image_url || product.image || '/placeholder.png'}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-200"
          loading="lazy"
          decoding="async"
        />
        
        {/* Badges */}
        {product.is_flash_sale && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded shadow-lg animate-pulse">
            Flash Sale
          </span>
        )}
        {product.is_top_seller && (
          <span className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold px-2 py-1 rounded shadow-lg">
            Top Seller
          </span>
        )}
        {product.is_new && (
          <span className="absolute bottom-2 left-2 bg-gradient-to-r from-green-500 to-teal-400 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
            New
          </span>
        )}
        {discountPercentage && (
          <span className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-cyan-400 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
            -{discountPercentage}%
          </span>
        )}
      </div>
      
      <div className="flex-1 flex flex-col p-3">
        <div className="text-sm text-gray-500 mb-1">{product.category}</div>
        <h3 className="font-semibold text-base mb-1 truncate" title={product.name}>
          {product.name}
        </h3>
        <div className="text-xs text-gray-400 mb-1">{product.brand}</div>
        
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-primary">
            KSh {product.price?.toLocaleString()}
          </span>
          {product.old_price && product.price < product.old_price && (
            <span className="text-xs line-through text-gray-400">
              KSh {product.old_price?.toLocaleString()}
            </span>
          )}
        </div>
        
        {/* Trust badges */}
        {product.trust_badges && product.trust_badges.length > 0 && (
          <div className="flex gap-2 mb-2">
            {product.trust_badges.map(badge => (
              <span 
                key={badge} 
                className="bg-gradient-to-r from-gray-100 to-gray-200 text-xs text-gray-700 px-2 py-1 rounded border border-gray-200 font-medium shadow"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 mt-auto">
          <button
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded transition w-full opacity-100 group-hover:scale-105 group-hover:shadow-lg focus:opacity-100"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </button>
          <button
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded transition w-full opacity-100 group-hover:scale-105 group-hover:shadow focus:opacity-100"
            onClick={handleQuickView}
            aria-label={`Quick view ${product.name}`}
          >
            Quick View
          </button>
        </div>
      </div>
    </motion.article>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;