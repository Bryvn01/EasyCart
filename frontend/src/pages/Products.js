import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { productsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchInput from '../components/ui/SearchInput';
import { ProductGridSkeleton } from '../components/ui';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';
import { useProducts } from '../hooks/useProducts';
import { getProductImageUrl } from '../utils/imageUtils';

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [currentPage, setCurrentPage] = useState(1);
  
  const { isAuthenticated } = useAuth();
  const { fetchCartCount } = useCart();
  const location = useLocation();

  // Use the products hook
  const { products, loading, pagination } = useProducts({
    page: currentPage,
    pageSize: 12,
    search: debouncedSearchTerm,
    category: selectedCategory,
    ordering: sortBy,
    priceRange
  });

  useEffect(() => {
    // Get search term from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const urlSearch = urlParams.get('search');
    if (urlSearch && urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
  }, [location.search, searchTerm]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy, priceRange.min, priceRange.max]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      // Handle paginated response from Django REST framework
      const categoriesData = response.data.results || response.data;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const addToCart = async (productId) => {
    if (!isAuthenticated) {
      handleApiError({ message: 'Please login to add items to cart' });
      return;
    }

    try {
      await ordersAPI.addToCart({ product_id: productId, quantity: 1 });
      fetchCartCount();
      handleApiSuccess('Product added to cart! 🛒');
    } catch (error) {
      console.error('Error adding to cart:', error);
      handleApiError(error, 'Failed to add product to cart');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {selectedCategory ? 
            `${categories.find(cat => cat.id === selectedCategory)?.name || 'Category'} Products` : 
            'Our Products'
          }
        </h1>
        <p style={{ color: 'var(--gray-600)' }}>
          {debouncedSearchTerm ? 
            `Search results for "${debouncedSearchTerm}"` :
            'Discover quality Kenyan products at great prices'
          }
        </p>
      </div>
      
      {/* Active Filters Summary */}
      {(selectedCategory || debouncedSearchTerm || sortBy || priceRange.min || priceRange.max) && (
        <div style={{ 
          background: 'var(--primary-50)', 
          padding: 'var(--space-3)', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--primary-700)' }}>
            <strong>Active Filters:</strong>
            {selectedCategory && <span> Category: {categories.find(cat => cat.id === selectedCategory)?.name}</span>}
            {debouncedSearchTerm && <span> Search: "{debouncedSearchTerm}"</span>}
            {sortBy && <span> Sort: {sortBy.replace('-', '').replace('_', ' ')}</span>}
            {(priceRange.min || priceRange.max) && <span> Price: KES {priceRange.min || '0'} - {priceRange.max || '∞'}</span>}
          </div>
          <button
            onClick={() => {
              setSelectedCategory('');
              setSearchTerm('');
              setDebouncedSearchTerm('');
              setSortBy('');
              setPriceRange({ min: '', max: '' });
            }}
            style={{
              background: 'var(--primary-600)',
              color: 'white',
              border: 'none',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
        </div>
      )}
      
      {/* Filters */}
      <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="grid grid-cols-5 gap-4">
          <div>
            <SearchInput
              onSearch={setSearchTerm}
              placeholder="Search products..."
            />
          </div>
          <div>
            <select
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {Array.isArray(categories) && categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="name">Name A-Z</option>
              <option value="-name">Name Z-A</option>
              <option value="price">Price Low to High</option>
              <option value="-price">Price High to Low</option>
              <option value="-created_at">Newest First</option>
              <option value="-view_count">Most Popular</option>
            </select>
          </div>
          <div>
            <input
              type="number"
              className="form-control"
              placeholder="Min Price (KES)"
              min="0"
              value={priceRange.min}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
                  setPriceRange(prev => ({ ...prev, min: value }));
                }
              }}
            />
          </div>
          <div>
            <input
              type="number"
              className="form-control"
              placeholder="Max Price (KES)"
              min="0"
              value={priceRange.max}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
                  setPriceRange(prev => ({ ...prev, max: value }));
                }
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="card">
            {/* Product Image */}
            <div style={{
              height: '200px',
              background: 'var(--gray-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {product.image ? (
                <img
                  src={getProductImageUrl(product, '/placeholder.png')}
                  alt={product.name}
                  crossOrigin="anonymous"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div style={{
                display: product.image ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gray-500)',
                fontSize: '2rem'
              }}>
                📦
              </div>
              
              {/* Stock Badge */}
              {product.stock === 0 && (
                <div style={{
                  position: 'absolute',
                  top: 'var(--space-2)',
                  right: 'var(--space-2)',
                  background: 'var(--error)',
                  color: 'white',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  Out of Stock
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="p-4">
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--primary-600)',
                fontWeight: '500',
                marginBottom: 'var(--space-1)'
              }}>
                {product.category?.name || product.category_name || 'Uncategorized'}
              </div>
              
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                lineHeight: '1.4'
              }}>
                {product.name}
              </h3>
              
              <p style={{
                color: 'var(--gray-600)',
                fontSize: '0.875rem',
                marginBottom: 'var(--space-4)',
                lineHeight: '1.4'
              }}>
                {product.description ? product.description.substring(0, 80) + '...' : 'No description available'}
              </p>
              
              <div className="flex justify-between items-center">
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: 'var(--gray-900)'
                }}>
                  KES {product.price}
                </span>
                
                <div className="flex gap-2">
                  <Link
                    to={`/products/${product.id}`}
                    className="btn btn-secondary"
                    style={{ padding: 'var(--space-2) var(--space-3)', fontSize: '0.75rem' }}
                  >
                    View
                  </Link>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="btn btn-primary"
                    disabled={product.stock === 0}
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      fontSize: '0.75rem',
                      opacity: product.stock === 0 ? 0.5 : 1
                    }}
                  >
                    {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {products.length === 0 && !loading && (
        <div className="text-center py-16">
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🔍</div>
          <h3 className="text-xl font-semibold mb-2">
            {debouncedSearchTerm ? `No products found for "${debouncedSearchTerm}"` : 'No products found'}
          </h3>
          <p style={{ color: 'var(--gray-600)' }}>
            {debouncedSearchTerm 
              ? 'Try searching with different keywords or check your spelling'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {debouncedSearchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDebouncedSearchTerm('');
              }}
              className="btn btn-secondary"
              style={{ marginTop: 'var(--space-4)' }}
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {products.length > 0 && pagination.totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginTop: 'var(--space-8)',
          padding: 'var(--space-4)'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={!pagination.hasPrevious}
            className="btn btn-secondary"
            style={{
              opacity: pagination.hasPrevious ? 1 : 0.5,
              cursor: pagination.hasPrevious ? 'pointer' : 'not-allowed'
            }}
          >
            Previous
          </button>

          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
            {/* Show page numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              // Calculate which pages to show
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-sm)',
                    background: currentPage === pageNum ? 'var(--primary-600)' : 'white',
                    color: currentPage === pageNum ? 'white' : 'var(--gray-700)',
                    cursor: 'pointer',
                    fontWeight: currentPage === pageNum ? '600' : '400',
                    minWidth: '40px'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
            disabled={!pagination.hasNext}
            className="btn btn-secondary"
            style={{
              opacity: pagination.hasNext ? 1 : 0.5,
              cursor: pagination.hasNext ? 'pointer' : 'not-allowed'
            }}
          >
            Next
          </button>

          <div style={{
            marginLeft: 'var(--space-4)',
            color: 'var(--gray-600)',
            fontSize: '0.875rem'
          }}>
            Page {pagination.currentPage} of {pagination.totalPages}
            {pagination.totalCount > 0 && ` (${pagination.totalCount} products)`}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;