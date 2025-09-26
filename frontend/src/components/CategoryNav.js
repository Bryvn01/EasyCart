import React from 'react';

const categories = [
  'Flash Sales',
  'Grocery Essentials',
  'TV Deals',
  'Phone Deals',
  'Beauty & Baby',
  'Fashion',
  'Home & Living',
  'Computing',
  'Appliances',
  'Supermarket',
  'Men',
  'Women',
  'Baby',
  'Sports',
  'Automobile',
];

const CategoryNav = ({ onSelectCategory, selectedCategory }) => (
  <nav className="w-full overflow-x-auto py-2 bg-white border-b border-gray-100">
    <ul className="flex gap-4 px-4 whitespace-nowrap">
      {categories.map(cat => (
        <li key={cat}>
          <button
            className={`px-4 py-2 rounded-full font-medium transition text-sm ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-primary/10'}`}
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
