import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { productsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchInput from '../components/ui/SearchInput';
import { ProductGridSkeleton } from '../components/ui';
import { handleApiError } from '../utils/errorHandler';
import { useProducts } from '../hooks/useProducts';
import HorizontalCategoryScroll from '../components/HorizontalCategoryScroll';
import ImageLightbox from '../components/ImageLightbox';
import SuccessAnimation from '../components/SuccessAnimation';
import EmptyState from '../components/EmptyState';
import ProductCard from '../components/ProductCard';
import AuthModal from '../components/AuthModal';
import useGuestCart from '../hooks/useGuestCart';
import { toast } from 'react-hot-toast';

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingCartProduct, setPendingCartProduct] = useState(null);

  const { isAuthenticated } = useAuth();
  const { fetchCartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Guest cart hook for non-authenticated users
  const { addToGuestCart, guestCartCount, migrateGuestCartToServer } = useGuestCart(isAuthenticated);

  // Use the products hook
  const { products, loading, pagination } = useProducts({
    page: currentPage,
    pageSize: 12,
    search: debouncedSearchTerm,
    category: selectedCategory,
    ordering: sortBy,
    priceRange
  });

  // INDUSTRY BEST PRACTICE: Auto-migrate guest cart to server on login
  useEffect(() => {
    if (isAuthenticated && guestCartCount > 0) {
      const migrate = async () => {
        const result = await migrateGuestCartToServer();
        if (result.success && result.itemsMigrated > 0) {
          toast.success(
            `Welcome back! ${result.itemsMigrated} item(s) from your guest cart have been added to your account.`,
            { duration: 5000 }
          );
          fetchCartCount(); // Refresh cart count
        }
      };
      migrate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    // INDUSTRY BEST PRACTICE: Read filters from URL on mount
    const urlParams = new URLSearchParams(location.search);
    const urlSearch = urlParams.get('search');
    const urlCategory = urlParams.get('category');
    const urlSort = urlParams.get('sort');
    const urlMinPrice = urlParams.get('min_price');
    const urlMaxPrice = urlParams.get('max_price');
    const urlPage = urlParams.get('page');

    if (urlSearch) setSearchTerm(urlSearch);
    if (urlCategory) setSelectedCategory(urlCategory);
    if (urlSort) setSortBy(urlSort);
    if (urlMinPrice || urlMaxPrice) {
      setPriceRange({ min: urlMinPrice || '', max: urlMaxPrice || '' });
    }
    if (urlPage) setCurrentPage(parseInt(urlPage) || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // INDUSTRY BEST PRACTICE: Sync filters to URL for shareable links
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy) params.set('sort', sortBy);
    if (priceRange.min) params.set('min_price', priceRange.min);
    if (priceRange.max) params.set('max_price', priceRange.max);
    if (currentPage > 1) params.set('page', currentPage);

    const newSearch = params.toString();
    const currentSearch = location.search.slice(1);

    // Only update URL if it actually changed (avoid infinite loops)
    if (newSearch !== currentSearch) {
      navigate({ search: newSearch ? `?${newSearch}` : '' }, { replace: true });
    }
  }, [debouncedSearchTerm, selectedCategory, sortBy, priceRange.min, priceRange.max, currentPage, navigate, location.search]);

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
    // INDUSTRY BEST PRACTICE: Allow guest cart, show auth modal with guest option
    if (!isAuthenticated) {
      // Add to guest cart immediately (localStorage)
      addToGuestCart(product, 1);

      // Show success feedback
      setSuccessProduct(product.name);
      setShowSuccess(true);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      // Show professional auth modal (non-blocking)
      setPendingCartProduct(product);
      setTimeout(() => {
        setShowAuthModal(true);
      }, 1500); // Show after success animation

      // Toast notification
      toast.success(
        <div>
          <strong>{product.name}</strong> added to cart!
          <br />
          <small>Sign in to save your cart across devices</small>
        </div>,
        { duration: 4000 }
      );

      return;
    }

    // Authenticated: Add to server cart
    try {
      await ordersAPI.addToCart({ product_id: product.id, quantity: 1 });
      fetchCartCount();
      setSuccessProduct(product.name);
      setShowSuccess(true);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      handleApiError(error, 'Unable to add product. Please try again.');
    }
  };

  // Handle pagination with smooth scroll to top
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Avoid animated scroll so pagination feedback feels immediate.
    window.scrollTo({
      top: 0,
      behavior: 'auto'
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
    <div className="container py-6 px-2 sm:px-4" style={{ maxWidth: '100%' }}>
      {/* Breadcrumb */}
      <nav className="mb-2 px-2 hidden sm:block" aria-label="Breadcrumb">
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
      <div className="mb-6 px-2">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2 tracking-tight">
          {selectedCategory ?
            `${selectedCategory} Products` :
            'Our Products'
          }
        </h1>
        <p className="text-gray-600 max-w-2xl">
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
          background: 'var(--gray-100)',
          border: '1px solid var(--gray-200)',
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
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
            className="btn btn-secondary"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Mobile Search Bar */}
      <div className="md:hidden mb-3 px-2">
        <SearchInput
          onSearch={setSearchTerm}
          placeholder="Search products..."
        />
      </div>

      {/* Mobile Category Scroll */}
      <HorizontalCategoryScroll
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Filters */}
      <div className="card hidden md:block" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div className="grid grid-cols-5 gap-4">
          <div>
            <SearchInput
              onSearch={setSearchTerm}
              placeholder="Search products..."
            />
          </div>
          <div>
            <label htmlFor="category-filter" className="sr-only">Category</label>
            <select
              id="category-filter"
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter products by category"
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
            <label htmlFor="sort-filter" className="sr-only">Sort By</label>
            <select
              id="sort-filter"
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
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
              step="1"
              value={priceRange.min}
              onChange={(e) => {
                const value = e.target.value;
                // BEST PRACTICE: Allow empty or valid positive numbers only
                if (value === '' || (!isNaN(value) && parseFloat(value) >= 0 && isFinite(parseFloat(value)))) {
                  setPriceRange(prev => ({ ...prev, min: value }));
                }
              }}
              onBlur={(e) => {
                // BEST PRACTICE: Validate min <= max on blur
                const min = parseFloat(e.target.value);
                const max = parseFloat(priceRange.max);
                if (!isNaN(min) && !isNaN(max) && min > max) {
                  toast.error('Minimum price cannot be greater than maximum price');
                  setPriceRange(prev => ({ ...prev, min: '' }));
                }
              }}
              aria-label="Minimum price filter"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">KSh</span>
            <input
              type="number"
              className="form-control pl-12"
              placeholder="Max Price"
              min="0"
              step="1"
              value={priceRange.max}
              onChange={(e) => {
                const value = e.target.value;
                // BEST PRACTICE: Allow empty or valid positive numbers only
                if (value === '' || (!isNaN(value) && parseFloat(value) >= 0 && isFinite(parseFloat(value)))) {
                  setPriceRange(prev => ({ ...prev, max: value }));
                }
              }}
              onBlur={(e) => {
                // BEST PRACTICE: Validate min <= max on blur
                const min = parseFloat(priceRange.min);
                const max = parseFloat(e.target.value);
                if (!isNaN(min) && !isNaN(max) && max < min) {
                  toast.error('Maximum price cannot be less than minimum price');
                  setPriceRange(prev => ({ ...prev, max: '' }));
                }
              }}
              aria-label="Maximum price filter"
            />
          </div>
        </div>
      </div>

      {/* Products Grid - Mobile-optimized responsive layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 px-1">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addToCart}
            loading={false}
            priority={index < 10}
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

      {/* Professional Auth Modal - Industry Best Practice */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingCartProduct(null);
        }}
        mode="login"
        message={`Sign in to save your cart and ${pendingCartProduct ? `continue shopping for ${pendingCartProduct.name}` : 'access exclusive features'}`}
        feature="add items to cart"
        allowGuest={false} // Already added to guest cart
        returnUrl={location.pathname + location.search}
      />

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
                     background: currentPage === pageNum ? 'var(--gray-900)' : 'white',
                    color: currentPage === pageNum ? 'white' : 'var(--gray-700)',
                    cursor: 'pointer',
                    fontWeight: currentPage === pageNum ? '600' : '400',
                    minWidth: '44px',
                    minHeight: '44px'
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
