import React, { useState } from 'react';
import { normalizeImageUrl } from '../../utils/imageUtils';

const CategoryCard = ({ category, onClick, isSelected }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const imageUrl = category.image_url || category.image;
  const normalizedUrl = imageUrl ? normalizeImageUrl(imageUrl) : null;

  const getCategoryEmoji = (name) => {
    const emojiMap = {
      'Groceries': '🛒',
      'Electronics': '📱',
      'Fashion': '👕',
      'Home & Kitchen': '🏠',
      'Beauty': '💄',
      'Sports': '⚽',
      'Books': '📚',
      'Toys': '🧸',
      'Health': '💊',
      'Automotive': '🚗',
      'Garden': '🌱',
      'Pets': '🐾',
      'Staples': '🌾',
      'Dairy': '🥛',
      'Beverages': '🥤',
      'Bakery': '🍞',
      'Spreads': '🧈',
      'Snacks': '🍿',
      'Fresh Produce': '🥬',
      'Meat & Poultry': '🍖',
      'Household': '🧼',
      'Personal Care': '🧴',
    };
    
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (name?.toLowerCase().includes(key.toLowerCase())) {
        return emoji;
      }
    }
    return '📦';
  };

  return (
    <button
      onClick={onClick}
      className={`group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      aria-label={`View ${category.name} products`}
    >
      <div className="aspect-square relative overflow-hidden bg-gray-50">
        {normalizedUrl && !imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
            )}
            <img
              src={normalizedUrl}
              alt={category.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
              {getCategoryEmoji(category.name)}
            </span>
          </div>
        )}
        
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm text-center group-hover:text-primary transition-colors">
          {category.name}
        </h3>
        {category.product_count > 0 && (
          <p className="text-xs text-gray-500 text-center mt-1">
            {category.product_count} items
          </p>
        )}
      </div>
    </button>
  );
};

export default CategoryCard;
