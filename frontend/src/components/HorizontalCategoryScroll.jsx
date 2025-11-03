import React from 'react';
import { Link } from 'react-router-dom';

const HorizontalCategoryScroll = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div 
      className="md:hidden overflow-x-auto scrollbar-hide mb-4"
      style={{
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div className="flex gap-3 px-4 py-2">
        <button
          onClick={() => onSelectCategory('')}
          className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all ${
            !selectedCategory 
              ? 'bg-primary-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={{ 
            scrollSnapAlign: 'start',
            touchAction: 'manipulation',
            minWidth: '80px'
          }}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.name)}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all ${
              selectedCategory === category.name
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{ 
              scrollSnapAlign: 'start',
              touchAction: 'manipulation',
              minWidth: '80px'
            }}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HorizontalCategoryScroll;
