import React from 'react';

const categories = [
  'Groceries',
  'Electronics', 
  'Fashion',
  'Home & Kitchen',
  'Beauty',
  'Phones',
  'Flash Sales',
  'TV Deals',
  'Baby',
  'Sports',
];

const CategoryNav = ({ onSelectCategory, selectedCategory }) => (
  <nav className="w-full overflow-x-auto py-3 bg-white border-b border-gray-100 scrollbar-hide">
    <ul className="flex gap-3 px-4 whitespace-nowrap">
      {categories.map(cat => (
        <li key={cat}>
          <button
            className={`px-4 py-2 rounded-full font-medium transition text-sm ${
              selectedCategory === cat 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-primary/10 hover:text-primary'
            }`}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </button>
        </li>
      ))}
    </ul>
  </nav>
);

export default CategoryNav;
