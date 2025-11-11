import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';

const CategoryNav = ({ onSelectCategory, selectedCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productsAPI.getCategories();
        const categoriesData = response.data.results || response.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to default categories if API fails
        setCategories([
          { id: 1, name: 'Groceries' },
          { id: 2, name: 'Electronics' },
          { id: 3, name: 'Fashion' },
          { id: 4, name: 'Home & Kitchen' },
          { id: 5, name: 'Beauty' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <nav className="w-full overflow-x-auto py-3 bg-white border-b border-gray-100 scrollbar-hide">
        <ul className="flex gap-3 px-4 whitespace-nowrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i}>
              <div className="px-4 py-2 rounded-full bg-gray-200 animate-pulse w-24 h-9" />
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav className="w-full overflow-x-auto py-3 bg-white border-b border-gray-100 scrollbar-hide">
      <ul className="flex gap-3 px-4 whitespace-nowrap">
        {categories.map(cat => (
          <li key={cat.id || cat.name}>
            <button
              className={`px-4 py-2 rounded-full font-medium transition text-sm ${
                selectedCategory === cat.name
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-primary/10 hover:text-primary'
              }`}
              onClick={() => onSelectCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CategoryNav;
