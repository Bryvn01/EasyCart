import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * CategoryList Component
 * Fetches and displays categories from the backend API
 */
const CategoryList = ({ onSelectCategory, selectedCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/categories/`);
        const categoriesData = response.data.results || response.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Failed to fetch categories');
        // Set fallback categories on error
        setCategories([
          { id: 1, name: 'Electronics' },
          { id: 2, name: 'Fashion' },
          { id: 3, name: 'Groceries' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} 
            className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">⚠️ {error}</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Desktop Category Pills */}
      <div className="hidden md:block">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Categories</h2>
        <div className="flex flex-wrap gap-3">
          {/* All Categories Button */}
          <button
            onClick={() => onSelectCategory && onSelectCategory(null)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              !selectedCategory 
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg ring-2 ring-primary-200' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary-200 shadow-sm'
            }`}
          >
            All Categories
          </button>

          {/* Category Buttons */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory && onSelectCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === category.id 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg ring-2 ring-primary-200' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary-200 shadow-sm'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Category Grid View */}
      <div className="hidden md:grid mt-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {categories.map((category) => {
          const imageUrl = category.image_url || category.image;
          return (
            <div
              key={category.id}
              onClick={() => onSelectCategory && onSelectCategory(category.id)}
              className={`group p-4 text-center rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg ring-2 ring-primary-200'
                  : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-xl border border-gray-100'
              }`}
            >
              <div className="mb-3">
                {imageUrl ? (
                  <div className="w-12 h-12 mx-auto rounded-full overflow-hidden bg-gray-100 shadow-inner">
                    <img 
                      src={imageUrl} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="text-2xl hidden">
                      {getCategoryIcon(category.name)}
                    </div>
                  </div>
                ) : (
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                    selectedCategory === category.id ? 'bg-white/20' : 'bg-gradient-to-br from-gray-100 to-gray-200'
                  }`}>
                    {getCategoryIcon(category.name)}
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-sm leading-tight">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-xs mt-1 opacity-75 line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Helper function to get category icon based on category name
 */
const getCategoryIcon = (categoryName) => {
  const icons = {
    'Electronics': '📱',
    'Fashion': '👗',
    'Groceries': '🛒',
    'Home & Living': '🏠',
    'Home & Kitchen': '🏠',
    'Beauty': '💄',
    'Sports': '⚽',
    'Books': '📚',
    'Toys': '🧸',
    'Health': '💊',
    'Food & Beverages': '🍔',
    'Household': '🧹',
    'Personal Care': '🧴',
    'Beverages': '🥤',
    'Automotive': '🚗',
  };

  return icons[categoryName] || '📦';
};

export default CategoryList;
