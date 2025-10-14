import React from 'react';
import { getProductImageUrl } from '../../utils/imageUtils';

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close quick view"
        >
          &times;
        </button>
        <div className="flex flex-col items-center">
          <img
            src={getProductImageUrl(product, '/placeholder.png')}
            alt={product.name}
            className="w-40 h-40 object-cover rounded mb-4"
            loading="lazy"
            crossOrigin="anonymous"
          />
          <h2 className="text-xl font-bold mb-2">{product.name}</h2>
          <div className="text-gray-500 text-sm mb-1">{product.category?.name || product.category_name || 'Uncategorized'}</div>
          <div className="text-gray-400 text-xs mb-2">{product.brand}</div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-primary">KSh {product.price?.toLocaleString()}</span>
            {product.old_price && product.price < product.old_price && (
              <span className="text-xs line-through text-gray-400">KSh {product.old_price?.toLocaleString()}</span>
            )}
          </div>
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">{product.description}</p>
          <button
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded transition"
            onClick={() => { onAddToCart(product); onClose(); }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
