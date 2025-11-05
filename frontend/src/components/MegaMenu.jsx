import React from 'react';
import { Link } from 'react-router-dom';

const MegaMenu = ({ isOpen, onClose }) => {
  const categories = [
    {
      name: 'Electronics',
      icon: '📱',
      subcategories: ['Smartphones', 'Laptops', 'TVs & Audio', 'Cameras']
    },
    {
      name: 'Fashion',
      icon: '👕',
      subcategories: ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Accessories']
    },
    {
      name: 'Groceries',
      icon: '🛒',
      subcategories: ['Fresh Produce', 'Dairy & Eggs', 'Beverages', 'Snacks']
    },
    {
      name: 'Home & Kitchen',
      icon: '🏠',
      subcategories: ['Furniture', 'Appliances', 'Cookware', 'Decor']
    },
    {
      name: 'Beauty & Health',
      icon: '💄',
      subcategories: ['Skincare', 'Makeup', 'Haircare', 'Vitamins']
    },
    {
      name: 'Sports & Outdoors',
      icon: '⚽',
      subcategories: ['Fitness', 'Outdoor Gear', 'Sports Equipment', 'Activewear']
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Mega Menu */}
      <div className="fixed inset-x-0 top-16 bottom-16 md:bottom-0 bg-white z-50 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors">
                <Link
                  to={`/products?category=${category.name}`}
                  onClick={onClose}
                  className="flex items-center gap-3 mb-3"
                >
                  <span className="text-3xl">{category.icon}</span>
                  <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                </Link>
                <ul className="space-y-2 ml-12">
                  {category.subcategories.map((sub, i) => (
                    <li key={i}>
                      <Link
                        to={`/products?category=${category.name}&sub=${sub}`}
                        onClick={onClose}
                        className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                      >
                        {sub}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Featured Banner */}
          <div className="mt-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">🎉 Special Offers</h3>
            <p className="mb-4">Get up to 50% off on selected items this week!</p>
            <Link
              to="/products?sale=true"
              onClick={onClose}
              className="inline-block bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Deals
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MegaMenu;
