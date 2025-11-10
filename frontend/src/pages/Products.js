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
import CompactProductCard from '../components/CompactProductCard';

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

  // Handle pagination with smooth scroll to top
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top of product grid smoothly
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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

      {/* Products Grid - Optimized for 100+ products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 pb-20 md:pb-8">
        {products.map((product, index) => (
          <CompactProductCard
            key={product.id}
            product={product}
            onAddToCart={addToCart}
            priority={index < 8}
            getProductImageUrl={getProductImageUrl}
          />
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
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                  onClick={() => handlePageChange(pageNum)}
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
            onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
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
