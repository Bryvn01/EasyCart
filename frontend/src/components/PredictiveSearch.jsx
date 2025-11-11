import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const PredictiveSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ categories: [], products: [] });
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Mock data - replace with API call
  const mockSearch = (searchQuery) => {
    const allCategories = ['Electronics', 'Fashion', 'Groceries', 'Home & Kitchen', 'Beauty'];
    const allProducts = [
      { id: 1, name: 'iPhone 15', category: 'Electronics', price: 'KSh 120,000', image: '📱' },
      { id: 2, name: 'Geisha Soap', category: 'Beauty', price: 'KSh 150', image: '🧼' },
      { id: 3, name: 'Fresh Tomatoes', category: 'Groceries', price: 'KSh 80/kg', image: '🍅' },
      { id: 4, name: 'Samsung TV 55"', category: 'Electronics', price: 'KSh 65,000', image: '📺' },
      { id: 5, name: 'Nike Sneakers', category: 'Fashion', price: 'KSh 8,500', image: '👟' }
    ];

    const filteredCategories = allCategories.filter(cat =>
      cat.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredProducts = allProducts.filter(prod =>
      prod.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return { categories: filteredCategories, products: filteredProducts.slice(0, 5) };
  };

  useEffect(() => {
    if (query.length > 1) {
      const timer = setTimeout(() => {
        setResults(mockSearch(query));
        setIsOpen(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for groceries, electronics, fashion..."
          className="w-full px-4 py-3 pl-12 pr-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none text-base"
          style={{ touchAction: 'manipulation' }}
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </form>

      {/* Dropdown Results */}
      {isOpen && (query.length > 1) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {/* Categories */}
          {results.categories.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Categories</div>
              {results.categories.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => {
                    navigate(`/products?category=${cat}`);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm font-medium text-gray-700"
                >
                  📁 {cat}
                </button>
              ))}
            </div>
          )}

          {/* Products */}
          {results.products.length > 0 && (
            <div className="p-3">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Products</div>
              {results.products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    navigate(`/products/${product.id}`);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded"
                >
                  <span className="text-3xl">{product.image}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.category}</div>
                  </div>
                  <div className="text-sm font-semibold text-primary-600">{product.price}</div>
                </button>
              ))}
            </div>
          )}

          {results.categories.length === 0 && results.products.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictiveSearch;
