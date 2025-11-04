import React, { useState } from 'react';

const CategoryCard = ({ category, isSelected, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isPressed, setIsPressed] = useState(false);
  
  // Enhanced category icons with better variety and modern emojis
  const categoryIcons = {
    'Groceries': '🛒',
    'Electronics': '📱',
    'Fashion': '👗',
    'Home & Kitchen': '🏠',
    'Beauty': '💄',
    'Sports': '⚽',
    'Books': '📚',
    'Toys': '🧸',
    'Health': '💊',
    'Automotive': '🚗',
    'Food & Beverages': '🍔',
    'Household': '🧩',
    'Personal Care': '🧴',
    'Beverages': '🥤',
    'Clothing': '👕',
    'Shoes': '👟',
    'Accessories': '💍',
    'Baby & Kids': '👶',
    'Pet Supplies': '🐶',
    'Garden': '🌱',
    'Office': '💼',
    'Travel': '✈️',
    'Music': '🎵',
    'Gaming': '🎮',
    'Fitness': '🏋️',
  };

  const getIcon = () => {
    return categoryIcons[category.name] || '📦';
  };

  const getCategoryImage = () => {
    if (imageError) return null;
    if (category.image_url) return category.image_url;
    if (category.image) {
      // Handle both full URLs and relative paths
      return category.image.startsWith('http') ? category.image : `${process.env.REACT_APP_API_URL}${category.image}`;
    }
    return null;
  };

  const imageUrl = getCategoryImage();

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <button
      onClick={() => onClick(category.name)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={`flex-shrink-0 flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 relative ${
        isSelected 
          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg ring-2 ring-primary-200' 
          : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200 hover:border-primary-200 shadow-sm'
      }`}
      style={{ 
        scrollSnapAlign: 'start',
        touchAction: 'manipulation',
        minWidth: '88px',
        width: '88px',
        minHeight: '88px',
        transform: isSelected ? 'scale(1.05)' : (isPressed ? 'scale(0.95)' : 'scale(1)'),
        willChange: 'transform'
      }}
      aria-label={`Filter by ${category.name}`}
      aria-pressed={isSelected}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-sm" />
      )}
      
      <div className="relative">
        {imageUrl && !imageError ? (
          <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shadow-inner relative">
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
            )}
            <img 
              src={imageUrl} 
              alt={category.name}
              className={`w-full h-full object-cover transition-all duration-200 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              } ${isSelected ? 'brightness-110' : ''}`}
              loading="lazy"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>
        ) : (
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl transition-all duration-200 ${
            isSelected ? 'bg-white/20 shadow-inner' : 'bg-gradient-to-br from-gray-100 to-gray-200'
          }`}>
            {getIcon()}
          </div>
        )}
        
        {isSelected && (
          <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
        )}
      </div>
      
      {/* Category Name */}
      <span className={`text-xs font-semibold text-center leading-tight line-clamp-2 px-1 transition-all duration-200 ${
        isSelected ? 'text-white' : 'text-gray-700'
      }`}>
        {category.name}
      </span>
      
      {/* Product Count (if available) */}
      {category.product_count && (
        <span className={`text-xs opacity-75 ${
          isSelected ? 'text-white/80' : 'text-gray-500'
        }`}>
          {category.product_count} items
        </span>
      )}
    </button>
  );
};

export default CategoryCard;
