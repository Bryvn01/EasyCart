import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import CategoryList from './CategoryList';

/**
 * ProductFilterBar: Search, filter, and sort bar for product listing
 * - Autocomplete search
 * - Category, brand, price range filters
 * - Sort dropdown
 */
const ProductFilterBar = ({ onChange, initial }) => {
  const [search, setSearch] = useState(initial?.search || '');
  const [category, setCategory] = useState(initial?.category || null);
  const [brand, setBrand] = useState(initial?.brand || '');
  const [price, setPrice] = useState(initial?.price || [0, 0]);
  const [sort, setSort] = useState(initial?.sort || '');
  const [brandOptions, setBrandOptions] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch brand options on mount
  useEffect(() => {
    productsAPI.getProducts({ distinct: 'brand' })
      .then(res => {
        const brands = (res.data.results || res.data)
          .map(p => p.brand)
          .filter(Boolean);
        setBrandOptions([...new Set(brands)]);
      })
      .catch(() => setBrandOptions([]));
  }, []);

  // Autocomplete search suggestions
  useEffect(() => {
    if (search.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    let active = true;
    productsAPI.getProducts({ search, limit: 5 })
      .then(res => {
        if (!active) return;
        const suggestions = (res.data.results || res.data).map(p => p.name);
        setSearchSuggestions(suggestions);
      })
      .catch(() => setSearchSuggestions([]));
    return () => { active = false; };
  }, [search]);

  // Handle filter changes
  useEffect(() => {
    onChange && onChange({ search, category, brand, price, sort });
  }, [search, category, brand, price, sort, onChange]);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row md:items-end gap-4">
      <div className="flex-1 relative">
        <label htmlFor="product-search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          id="product-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
          placeholder="Search products..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[color:var(--primary,#2563eb)] focus:border-transparent"
          autoComplete="off"
        />
        {showSuggestions && searchSuggestions.length > 0 && (
          <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded shadow mt-1 max-h-48 overflow-auto">
            {searchSuggestions.map((s, i) => (
              <li
                key={i}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => { setSearch(s); setShowSuggestions(false); }}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <CategoryList selectedCategory={category} onSelectCategory={setCategory} />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
        <select
          value={brand}
          onChange={e => setBrand(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[color:var(--primary,#2563eb)] focus:border-transparent"
        >
          <option value="">All Brands</option>
          {brandOptions.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 flex gap-2 items-end">
        <div className="flex-1">
          <label htmlFor="price-min" className="block text-sm font-medium text-gray-700 mb-1">Price Min</label>
          <input
            id="price-min"
            type="number"
            inputMode="numeric"
            min="0"
            value={price[0]}
            onChange={e => setPrice([+e.target.value, price[1]])}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[color:var(--primary,#2563eb)] focus:border-transparent"
            placeholder="Min"
            aria-label="Minimum price filter"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="price-max" className="block text-sm font-medium text-gray-700 mb-1">Price Max</label>
          <input
            id="price-max"
            type="number"
            inputMode="numeric"
            min="0"
            value={price[1]}
            onChange={e => setPrice([price[0], +e.target.value])}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[color:var(--primary,#2563eb)] focus:border-transparent"
            placeholder="Max"
            aria-label="Maximum price filter"
          />
        </div>
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[color:var(--primary,#2563eb)] focus:border-transparent"
        >
          <option value="">Default</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="popularity">Popularity</option>
          <option value="-created">Newest</option>
        </select>
      </div>
    </div>
  );
};

export default ProductFilterBar;
