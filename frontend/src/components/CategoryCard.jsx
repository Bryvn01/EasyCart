import React, { useState } from 'react';
import {
  FiShoppingBag,
  FiSmartphone,
  FiHome,
  FiBook,
  FiHeart,
  FiPackage
} from 'react-icons/fi';
import {
  GiSoccerBall,
  GiLipstick,
  GiClothes,
  GiRunningShoe,
  GiBabyBottle,
  GiDogBowl,
  GiFlowerPot,
  GiBriefcase,
  GiGamepad,
  GiWeightLiftingUp
} from 'react-icons/gi';
import {
  FaCar,
  FaPlane,
  FaMusic,
  FaUtensils,
  FaRing,
  FaTshirt
} from 'react-icons/fa';
import { MdHealthAndSafety } from 'react-icons/md';

const CategoryCard = ({ category, isSelected, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isPressed, setIsPressed] = useState(false);

  // Professional icon mapping with React Icons
  const getCategoryIcon = () => {
    const iconMap = {
      'Groceries': <FiShoppingBag className="w-full h-full" />,
      'Electronics': <FiSmartphone className="w-full h-full" />,
      'Fashion': <GiClothes className="w-full h-full" />,
      'Home & Kitchen': <FiHome className="w-full h-full" />,
      'Beauty': <GiLipstick className="w-full h-full" />,
      'Sports': <GiSoccerBall className="w-full h-full" />,
      'Books': <FiBook className="w-full h-full" />,
      'Toys': <GiGamepad className="w-full h-full" />,
      'Health': <MdHealthAndSafety className="w-full h-full" />,
      'Automotive': <FaCar className="w-full h-full" />,
      'Food & Beverages': <FaUtensils className="w-full h-full" />,
      'Household': <FiHome className="w-full h-full" />,
      'Personal Care': <FiHeart className="w-full h-full" />,
      'Beverages': <FaUtensils className="w-full h-full" />,
      'Clothing': <FaTshirt className="w-full h-full" />,
      'Shoes': <GiRunningShoe className="w-full h-full" />,
      'Accessories': <FaRing className="w-full h-full" />,
      'Baby & Kids': <GiBabyBottle className="w-full h-full" />,
      'Pet Supplies': <GiDogBowl className="w-full h-full" />,
      'Garden': <GiFlowerPot className="w-full h-full" />,
      'Office': <GiBriefcase className="w-full h-full" />,
      'Travel': <FaPlane className="w-full h-full" />,
      'Music': <FaMusic className="w-full h-full" />,
      'Gaming': <GiGamepad className="w-full h-full" />,
      'Fitness': <GiWeightLiftingUp className="w-full h-full" />,
    };

    return iconMap[category.name] || <FiPackage className="w-full h-full" />;
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
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-primary-600 transition-all duration-200 ${
            isSelected ? 'bg-white/20 shadow-inner' : 'bg-gradient-to-br from-gray-100 to-gray-200'
          }`}>
            {getCategoryIcon()}
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
