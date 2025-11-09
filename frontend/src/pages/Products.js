import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { productsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchInput from '../components/ui/SearchInput';
import { ProductGridSkeleton } from '../components/ui';
import { handleApiError } from '../utils/errorHandler';
import { useProducts } from '../hooks/useProducts';
import { getProductImageUrl } from '../utils/imageUtils';
import HorizontalCategoryScroll from '../components/HorizontalCategoryScroll';
import ImageLightbox from '../components/ImageLightbox';
import SuccessAnimation from '../components/SuccessAnimation';
import EmptyState from '../components/EmptyState';
import ProgressiveImage from '../components/ui/ProgressiveImage';

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successProduct, setSuccessProduct] = useState('');

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
    // Get search term and category from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const urlSearch = urlParams.get('search');
    const urlCategory = urlParams.get('category');

    if (urlSearch) {
      setSearchTerm(urlSearch);
    }

    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else if (!urlCategory && selectedCategory) {
      // Clear category if not in URL
      setSelectedCategory('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

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

  const addToCart = async (product) => {
    if (!isAuthenticated) {
      handleApiError({ message: 'Please login to add items to cart' });
      return;
    }

    try {
      await ordersAPI.addToCart({ product_id: product.id, quantity: 1 });
      fetchCartCount();
      setSuccessProduct(product.name);
      setShowSuccess(true);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      handleApiError(error, 'Failed to add product to cart');
    }
  };

  // PERFORMANCE: Loading skeleton optimized
  if (loading && products.length === 0) {
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
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-gray-600">
          <li><Link to="/" className="hover:text-primary-600">Home</Link></li>
          <li>›</li>
          <li className="text-gray-900 font-medium">Products</li>
          {selectedCategory && (
            <>
              <li>›</li>
              <li className="text-gray-900 font-medium">
                {selectedCategory}
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {selectedCategory ?
            `${selectedCategory} Products` :
            'Our Products'
          }
        </h1>
        <p style={{ color: 'var(--gray-600)' }}>
          {debouncedSearchTerm ?
            `Search results for "${debouncedSearchTerm}"` :
            'Discover quality Kenyan products at great prices'
          }
        </p>
        {pagination.totalCount > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Showing {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, pagination.totalCount)} of {pagination.totalCount} products
          </p>
        )}
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
            {selectedCategory && <span> Category: {selectedCategory}</span>}
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

      {/* Mobile Category Scroll */}
      <HorizontalCategoryScroll
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Filters */}
      <div className="card hidden md:block" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
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
                <option key={category.id} value={category.name}>
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
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">KSh</span>
            <input
              type="number"
              className="form-control pl-12"
              placeholder="Min Price"
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
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">KSh</span>
            <input
              type="number"
              className="form-control pl-12"
              placeholder="Max Price"
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 pb-20 md:pb-8">
        {products.map(product => (
          <div
            key={product.id}
            className="card group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 active:scale-98"
            style={{
              cursor: 'pointer',
              overflow: 'hidden',
              touchAction: 'manipulation',
              borderRadius: '8px'
            }}
          >
            {/* Product Image */}
            <div
              onClick={() => setLightboxImage({ url: getProductImageUrl(product), name: product.name })}
              style={{
                cursor: 'zoom-in',
                height: '200px',
                background: 'var(--gray-100)',
                position: 'relative',
                overflow: 'hidden'
              }}>
              <ProgressiveImage
                src={getProductImageUrl(product, '/placeholder.png')}
                thumbnail={product.thumbnail_url}
                alt={product.name}
                aspectRatio="auto"
                className="group-hover:scale-110 transition-transform duration-500"
              />

              {/* Badges */}
              {product.stock === 0 ? (
                <div style={{
                  position: 'absolute',
                  top: 'var(--space-2)',
                  right: 'var(--space-2)',
                  background: '#ef4444',
                  color: 'white',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  Out of Stock
                </div>
              ) : product.stock < 10 ? (
                <div style={{
                  position: 'absolute',
                  top: 'var(--space-2)',
                  right: 'var(--space-2)',
                  background: '#f59e0b',
                  color: 'white',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  Only {product.stock} left
                </div>
              ) : (
                <div style={{
                  position: 'absolute',
                  top: 'var(--space-2)',
                  right: 'var(--space-2)',
                  background: '#10b981',
                  color: 'white',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  In Stock
                </div>
              )}

              {/* New/Featured Badge */}
              {product.is_featured && (
                <div style={{
                  position: 'absolute',
                  top: 'var(--space-2)',
                  left: 'var(--space-2)',
                  background: '#8b5cf6',
                  color: 'white',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Featured
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--primary-600)',
                fontWeight: '500',
                marginBottom: 'var(--space-1)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {product.category?.name || product.category_name || 'Uncategorized'}
              </div>

              {product.brand && (
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--gray-500)',
                  marginBottom: 'var(--space-1)'
                }}>
                  {product.brand}
                </div>
              )}

              <Link to={`/products/${product.id}`}>
                <h3
                  className="hover:text-primary-600 transition-colors"
                  style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: 'var(--space-2)',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '2.8em'
                  }}
                  title={product.name}
                >
                  {product.name}
                </h3>
              </Link>

              {/* Star Rating */}
              {product.rating && (
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs text-gray-600 ml-1">({product.rating})</span>
                </div>
              )}

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--primary-600)'
                  }}>
                    KSh {parseFloat(product.price).toLocaleString()}
                  </span>
                  {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
                    <>
                      <span style={{
                        fontSize: '1rem',
                        color: 'var(--gray-400)',
                        textDecoration: 'line-through'
                      }}>
                        KSh {parseFloat(product.compare_price).toLocaleString()}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#10b981',
                        background: '#d1fae5',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {Math.round(((parseFloat(product.compare_price) - parseFloat(product.price)) / parseFloat(product.compare_price)) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center gap-2">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  className="btn btn-primary w-full hover:scale-105 transition-transform min-h-[44px] inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  disabled={product.stock === 0}
                  style={{
                    padding: 'var(--space-3)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    opacity: product.stock === 0 ? 0.5 : 1,
                    cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {product.stock === 0 ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>Sold Out</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick View Button (appears on hover) - PWA compliant */}
              <Link
                to={`/products/${product.id}`}
                className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 min-h-[44px] flex items-center justify-center gap-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.98)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--primary-600)',
                  border: '2px solid var(--primary-600)',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Quick View</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <EmptyState
          type={debouncedSearchTerm ? 'search' : 'products'}
          onAction={debouncedSearchTerm ? () => {
            setSearchTerm('');
            setDebouncedSearchTerm('');
          } : null}
        />
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          imageUrl={lightboxImage.url}
          productName={lightboxImage.name}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {/* Success Animation */}
      {showSuccess && (
        <SuccessAnimation
          message={`${successProduct} added to cart!`}
          onComplete={() => setShowSuccess(false)}
        />
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
