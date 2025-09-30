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
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      <div className="flex flex-wrap gap-3">
        {/* All Categories Button */}
        <button
          onClick={() => onSelectCategory && onSelectCategory(null)}
          className={`px-4 py-2 rounded-full font-medium transition ${
            !selectedCategory 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Categories
        </button>

        {/* Category Buttons */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory && onSelectCategory(category.id)}
            className={`px-4 py-2 rounded-full font-medium transition ${
              selectedCategory === category.id 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Category Grid View (Alternative Display) */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => onSelectCategory && onSelectCategory(category.id)}
            className={`p-4 text-center rounded-lg cursor-pointer transition ${
              selectedCategory === category.id
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg'
            }`}
          >
            <div className="text-3xl mb-2">
              {getCategoryIcon(category.name)}
            </div>
            <h3 className="font-semibold text-sm">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-xs mt-1 opacity-75">
                {category.description}
              </p>
            )}
          </div>
        ))}
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
    'Beauty': '💄',
    'Sports': '⚽',
    'Books': '📚',
    'Toys': '🧸',
    'Health': '🏥',
    'Food & Beverages': '🍔',
    'Household': '🧹',
    'Personal Care': '🧴',
    'Beverages': '🥤',
  };

  return icons[categoryName] || '📦';
};

export default CategoryList;
