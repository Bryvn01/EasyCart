import React, { useState, useEffect } from 'react';
import './MobileFilterModal.css';

const MobileFilterModal = ({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  onApplyFilters,
  onClearFilters,
  productCount = 0
}) => {
  const [localCategory, setLocalCategory] = useState(selectedCategory);
  const [localSort, setLocalSort] = useState(sortBy);
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);
  const [activeTab, setActiveTab] = useState('category'); // category, sort, price

  // Update local state when props change
  useEffect(() => {
    setLocalCategory(selectedCategory);
    setLocalSort(sortBy);
    setLocalPriceRange(priceRange);
  }, [selectedCategory, sortBy, priceRange]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const handleApply = () => {
    onCategoryChange(localCategory);
    onSortChange(localSort);
    onPriceRangeChange(localPriceRange);
    onApplyFilters?.();
    onClose();
  };

  const handleClear = () => {
    setLocalCategory('');
    setLocalSort('');
    setLocalPriceRange({ min: '', max: '' });
    onClearFilters();
    onClose();
  };

  const hasActiveFilters = localCategory || localSort || localPriceRange.min || localPriceRange.max;

  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'name', label: 'Name: A to Z' },
    { value: '-name', label: 'Name: Z to A' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-created_at', label: 'Newest First' },
    { value: '-view_count', label: 'Most Popular' }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="mobile-filter-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="mobile-filter-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
      >
        {/* Header */}
        <div className="mobile-filter-header">
          <button
            onClick={onClose}
            className="mobile-filter-close"
            aria-label="Close filters"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 id="filter-modal-title" className="mobile-filter-title">
            Filters & Sort
          </h2>
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="mobile-filter-clear-link"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="mobile-filter-tabs">
          <button
            className={`mobile-filter-tab ${activeTab === 'category' ? 'active' : ''}`}
            onClick={() => setActiveTab('category')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Category
            {localCategory && <span className="badge">1</span>}
          </button>
          <button
            className={`mobile-filter-tab ${activeTab === 'sort' ? 'active' : ''}`}
            onClick={() => setActiveTab('sort')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Sort
            {localSort && <span className="badge">1</span>}
          </button>
          <button
            className={`mobile-filter-tab ${activeTab === 'price' ? 'active' : ''}`}
            onClick={() => setActiveTab('price')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Price
            {(localPriceRange.min || localPriceRange.max) && <span className="badge">1</span>}
          </button>
        </div>

        {/* Content */}
        <div className="mobile-filter-content">
          {/* Category Tab */}
          {activeTab === 'category' && (
            <div className="mobile-filter-section">
              <div className="mobile-filter-options">
                <label className="mobile-filter-option">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={localCategory === ''}
                    onChange={(e) => setLocalCategory(e.target.value)}
                  />
                  <span className="mobile-filter-option-label">
                    All Categories
                    {localCategory === '' && (
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                </label>
                {Array.isArray(categories) && categories.map(category => (
                  <label key={category.id} className="mobile-filter-option">
                    <input
                      type="radio"
                      name="category"
                      value={category.name}
                      checked={localCategory === category.name}
                      onChange={(e) => setLocalCategory(e.target.value)}
                    />
                    <span className="mobile-filter-option-label">
                      {category.name}
                      {localCategory === category.name && (
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sort Tab */}
          {activeTab === 'sort' && (
            <div className="mobile-filter-section">
              <div className="mobile-filter-options">
                {sortOptions.map(option => (
                  <label key={option.value} className="mobile-filter-option">
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      checked={localSort === option.value}
                      onChange={(e) => setLocalSort(e.target.value)}
                    />
                    <span className="mobile-filter-option-label">
                      {option.label}
                      {localSort === option.value && (
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Tab */}
          {activeTab === 'price' && (
            <div className="mobile-filter-section">
              <div className="mobile-filter-price-inputs">
                <div className="mobile-filter-input-group">
                  <label htmlFor="min-price" className="mobile-filter-label">
                    Min Price (KSh)
                  </label>
                  <div className="mobile-filter-input-wrapper">
                    <span className="mobile-filter-currency">KSh</span>
                    <input
                      id="min-price"
                      type="number"
                      inputMode="numeric"
                      placeholder="0"
                      min="0"
                      value={localPriceRange.min}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
                          setLocalPriceRange(prev => ({ ...prev, min: value }));
                        }
                      }}
                      className="mobile-filter-input"
                    />
                  </div>
                </div>
                <div className="mobile-filter-price-divider">—</div>
                <div className="mobile-filter-input-group">
                  <label htmlFor="max-price" className="mobile-filter-label">
                    Max Price (KSh)
                  </label>
                  <div className="mobile-filter-input-wrapper">
                    <span className="mobile-filter-currency">KSh</span>
                    <input
                      id="max-price"
                      type="number"
                      inputMode="numeric"
                      placeholder="Any"
                      min="0"
                      value={localPriceRange.max}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
                          setLocalPriceRange(prev => ({ ...prev, max: value }));
                        }
                      }}
                      className="mobile-filter-input"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Price Ranges */}
              <div className="mobile-filter-quick-prices">
                <p className="mobile-filter-label" style={{ marginBottom: '12px' }}>Quick Select:</p>
                <div className="mobile-filter-price-chips">
                  {[
                    { label: 'Under 1K', min: '', max: '1000' },
                    { label: '1K - 5K', min: '1000', max: '5000' },
                    { label: '5K - 10K', min: '5000', max: '10000' },
                    { label: '10K - 20K', min: '10000', max: '20000' },
                    { label: 'Over 20K', min: '20000', max: '' }
                  ].map((range, index) => (
                    <button
                      key={index}
                      onClick={() => setLocalPriceRange({ min: range.min, max: range.max })}
                      className={`mobile-filter-price-chip ${
                        localPriceRange.min === range.min && localPriceRange.max === range.max
                          ? 'active'
                          : ''
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mobile-filter-footer">
          <button
            onClick={handleClear}
            className="mobile-filter-btn mobile-filter-btn-secondary"
            disabled={!hasActiveFilters}
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="mobile-filter-btn mobile-filter-btn-primary"
          >
            Show {productCount > 0 ? `${productCount} ` : ''}Products
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileFilterModal;
