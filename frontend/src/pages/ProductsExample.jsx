import React, { useState } from 'react';
import ProductList from '../components/ProductList';
import CategoryList from '../components/CategoryList';

/**
 * Example page demonstrating the usage of ProductList and CategoryList components
 * These components fetch data from the backend API endpoints
 */
const ProductsExample = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            API-Integrated Products
          </h1>
          <p className="text-gray-600">
            This page demonstrates ProductList and CategoryList components
            fetching data from backend API endpoints
          </p>
        </div>

        {/* Category Selection */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <CategoryList
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Products Display */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">
            {selectedCategory ? 'Filtered Products' : 'All Products'}
          </h2>
          <ProductList />
        </div>

        {/* API Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            🔌 API Endpoints Used
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              <strong>Products:</strong>{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">
                {process.env.REACT_APP_API_URL}/products/
              </code>
            </li>
            <li>
              <strong>Categories:</strong>{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">
                {process.env.REACT_APP_API_URL}/categories/
              </code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductsExample;
