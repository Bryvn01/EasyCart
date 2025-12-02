import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchInput from '../components/ui/SearchInput';
import { ProductGridSkeleton, TrustBadges } from '../components/ui';
import { handleApiError } from '../utils/errorHandler';
import { useProducts } from '../hooks/useProducts';
import HorizontalCategoryScroll from '../components/HorizontalCategoryScroll';
import ImageLightbox from '../components/ImageLightbox';
import SuccessAnimation from '../components/SuccessAnimation';
import EmptyState from '../components/EmptyState';
import ProductCard from '../components/ProductCard';
import ProductsPageHero from '../components/ProductsPageHero';
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
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{selectedCategory ? `${selectedCategory} - Shop EasyCart` : 'Shop All Products - EasyCart Kenya'}</title>
        <meta name="description" content={`${selectedCategory ? `Shop ${selectedCategory} products` : 'Discover quality Kenyan products'} at EasyCart. Fast delivery in Nairobi, secure payments, and easy returns.`} />
        <meta name="keywords" content={`${selectedCategory || 'products'}, online shopping, Kenya, Nairobi, EasyCart`} />
        <link rel="canonical" href={`https://easycart.co.ke/products${selectedCategory ? `?category=${selectedCategory}` : ''}`} />
      </Helmet>

      {/* Breadcrumb - Enhanced with schema markup */}
      <nav className="mb-6" aria-label="Breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList">
        <ol className="flex items-center gap-2 text-sm text-gray-600">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to="/" className="hover:text-primary-600" itemProp="item">
              <span itemProp="name">Home</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>
          <li aria-hidden="true">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <span className="text-gray-900 font-medium" itemProp="name">Products</span>
            <meta itemProp="position" content="2" />
          </li>
          {selectedCategory && (
            <>
              <li aria-hidden="true">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <span className="text-primary-600 font-medium" itemProp="name">
                  {selectedCategory}
                </span>
                <meta itemProp="position" content="3" />
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* Hero Banner - Show only when no search/filters active */}
      {!debouncedSearchTerm && !selectedCategory && (
        <ProductsPageHero
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {selectedCategory ?
            `${selectedCategory} Products` :
            'Our Products'
          }
        </h1>
        <p className="text-gray-600">
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

      {/* Products Grid - Professional look (matches homepage) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                    background: currentPage === pageNum ? 'var(--primary-600)' : 'white',
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

      {/* Trust & Engagement Section */}
      <section className="mt-12 pt-8 border-t border-gray-200" aria-label="Trust and security features">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Why Shop With EasyCart?</h2>
          <p className="text-gray-600">Trusted by thousands of customers across Kenya</p>
        </div>
        <TrustBadges />
      </section>

      {/* Newsletter Signup CTA */}
      <section className="mt-12 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-8 text-white" aria-label="Newsletter signup">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Stay Updated!</h2>
          <p className="text-white/90 mb-6">Get exclusive deals, new arrivals, and special offers delivered to your inbox.</p>
          <form 
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" 
            onSubmit={(e) => {
              e.preventDefault();
              const email = e.target.email?.value;
              if (email) {
                toast.success('Thank you for subscribing! Check your email for confirmation.');
                e.target.reset();
              } else {
                toast.error('Please enter a valid email address.');
              }
            }}
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Email address for newsletter"
              required
            />
            <button
              type="submit"
              className="bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
            >
              Subscribe
            </button>
          </form>
          <p className="text-white/70 text-sm mt-4">No spam, unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
};

export default Products;
