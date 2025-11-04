import React, { useRef, useEffect } from 'react';
import CategoryCard from './CategoryCard';

const HorizontalCategoryScroll = ({ categories, selectedCategory, onSelectCategory }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (selectedCategory && scrollRef.current) {
      const selectedElement = scrollRef.current.querySelector(`[data-category="${selectedCategory}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'center' 
        });
      }
    }
  }, [selectedCategory]);

  return (
    <div className="md:hidden mb-4">
      <div className="px-4 mb-3">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Shop by Category</h2>
        <p className="text-sm text-gray-600">Find what you're looking for</p>
      </div>
      
      <div 
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide py-3"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollPaddingLeft: '16px',
          scrollPaddingRight: '16px',
          background: 'linear-gradient(to right, rgba(249, 250, 251, 0.5), white, rgba(249, 250, 251, 0.5))',
          willChange: 'scroll-position'
        }}
      >
        <div className="flex gap-3 px-4 pb-1" style={{ minWidth: 'max-content' }}>
          <button
            onClick={() => onSelectCategory('')}
            data-category=""
            className={`flex-shrink-0 flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              !selectedCategory 
                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg ring-2 ring-primary-200' 
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200 hover:border-primary-200 shadow-sm'
            }`}
            style={{ 
              scrollSnapAlign: 'start',
              touchAction: 'manipulation',
              minWidth: '88px',
              width: '88px',
              minHeight: '88px',
              transform: !selectedCategory ? 'scale(1.05)' : 'scale(1)'
            }}
            aria-label="Show all categories"
            aria-pressed={!selectedCategory}
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl transition-all duration-200 ${
              !selectedCategory ? 'bg-white/20 shadow-inner' : 'bg-gradient-to-br from-gray-100 to-gray-200'
            }`}>
              🏪
            </div>
            <span className="text-xs font-semibold text-center leading-tight px-1">
              All
            </span>
            {!selectedCategory && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-sm" />
            )}
          </button>

          {/* Enhanced Category Cards */}
          {categories.map((category) => (
            <div key={category.id} data-category={category.name}>
              <CategoryCard
                category={category}
                isSelected={selectedCategory === category.name}
                onClick={onSelectCategory}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-2 px-4">
        <div className="flex space-x-1.5">
          {Array.from({ length: Math.min(5, Math.ceil((categories.length + 1) / 4)) }).map((_, i) => (
            <div 
              key={i} 
              className="w-1.5 h-1.5 rounded-full bg-gray-300 transition-all duration-200"
              style={{ opacity: i === 0 ? 1 : 0.5 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HorizontalCategoryScroll;
