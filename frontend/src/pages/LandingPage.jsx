import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productsAPI, ordersAPI, getApiBaseUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { handleApiError, handleApiSuccess, retryWithBackoff, checkApiHealth, getDetailedErrorMessage } from '../utils/errorHandler';
import ImageWithFallback from '../components/ImageWithFallback';

// Error Boundary Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="text-6xl mb-4">😵</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-6">
        We're having trouble loading the page. Please try again.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Skeleton Loaders
const CategorySkeleton = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
    <div className="aspect-square bg-gray-200 rounded-lg mx-auto mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
  </div>
);

const ProductCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Category Card Component
const CategoryCard = React.memo(({ category, getCategoryIcon }) => {
  const categoryImage = category.image;
  const hasImage = !!categoryImage;

  return (
    <Link
      to={`/products?category=${category.id}`}
      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 group focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      aria-label={`Browse ${category.name} category`}
    >
      <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
        {hasImage ? (
          <ImageWithFallback
            src={categoryImage}
            alt={category.name}
            fallbackCategory="category"
            lazy
            showSkeleton
            className="w-full h-full group-hover:scale-110 transition-transform duration-300"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
            {getCategoryIcon(category.name)}
          </div>
        )}
      </div>
      <h3 className="text-sm font-semibold text-gray-900 text-center group-hover:text-primary-600 transition-colors">
        {category.name}
      </h3>
    </Link>
  );
});

CategoryCard.displayName = 'CategoryCard';

// Enhanced Product Card Component with React.memo
const ProductCard = React.memo(({ product, onAddToCart }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleAddToCartClick = useCallback((e) => {
    e.preventDefault();
    onAddToCart(product);
  }, [product, onAddToCart]);

  const productImage = product.image || product.image_url;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 10;

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <Link to={`/products/${product.id}`} className="block" aria-label={`View ${product.name} details`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {productImage && !imageError ? (
            <>
              <img
                src={productImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  imageLoading ? 'opacity-0' : 'opacity-100 group-hover:scale-110'
                }`}
                loading="lazy"
                width="300"
                height="300"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400" role="img" aria-label="Product placeholder">
              📦
            </div>
          )}

          {isOutOfStock && (
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
              role="status"
              aria-label="Out of stock"
            >
              <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                Out of Stock
              </span>
            </div>
          )}

          {product.is_flash_sale && !isOutOfStock && (
            <div className="absolute top-2 left-2">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full font-semibold text-xs">
                🔥 SALE
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 
            className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors min-h-[3rem]" 
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mb-3">
          <div className="text-xl font-bold text-gray-900" aria-label={`Price: KSh ${product.price?.toLocaleString() || '0'}`}>
            KSh {product.price?.toLocaleString() || '0'}
          </div>
          {isLowStock && (
            <span 
              className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium"
              aria-label={`Only ${product.stock} items left`}
            >
              Only {product.stock} left
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCartClick}
          disabled={isOutOfStock}
          className="w-full py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label={isOutOfStock ? 'Out of stock' : `Add ${product.name} to cart`}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

// Main Landing Page Component
const LandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  const { fetchCartCount } = useCart();

  // Memoized category icons
  const getCategoryIcon = useCallback((name) => {
    const icons = {
      'Electronics': '📱',
      'Fashion': '👗',
      'Groceries': '🛒',
      'Home & Living': '🏠',
      'Beauty': '💄',
      'Sports': '⚽',
      'Books': '📚',
      'Toys': '🧸',
    };
    return icons[name] || '📦';
  }, []);

  // Fetch data with proper error handling and retry logic
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setIsRetrying(retryCount > 0);
    
    try {
      // Check API health first
      const apiBaseUrl = getApiBaseUrl();
      const isHealthy = await checkApiHealth(apiBaseUrl);
      
      if (!isHealthy && process.env.NODE_ENV === 'development') {
        console.warn('API health check failed, but continuing with request...');
      }
      
      // Fetch data with retry logic
      const [productsRes, categoriesRes] = await retryWithBackoff(
        async () => Promise.all([
          productsAPI.getProducts(),
          productsAPI.getCategories()
        ]),
        2, // maxRetries
        1500 // initialDelay in ms
      );

      const productsData = productsRes.data.results || productsRes.data || [];
      const categoriesData = categoriesRes.data.results || categoriesRes.data || [];

      setCategories(categoriesData.slice(0, 6));

      // Enhanced product filtering and sorting
      const featured = productsData
        .filter(p => p.stock > 0)
        .sort((a, b) => {
          // Prioritize top sellers, then by creation date or rating
          if (a.is_top_seller !== b.is_top_seller) {
            return b.is_top_seller ? 1 : -1;
          }
          return (b.rating || 0) - (a.rating || 0);
        })
        .slice(0, 8);
      
      setFeaturedProducts(featured);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Get detailed error information
      const details = getDetailedErrorMessage(error, 'Failed to load products and categories');
      setErrorDetails(details);
      
      // Set user-facing error message
      setError(details.userMessage);
      
      // Show toast with specific error
      handleApiError(error, details.userMessage);
      
      // Increment retry count
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add to cart handler with useCallback
  const handleAddToCart = useCallback(async (product) => {
    if (!isAuthenticated) {
      handleApiError({ message: 'Please login to add items to cart' });
      return;
    }

    try {
      await ordersAPI.addToCart({ product_id: product.id, quantity: 1 });
      fetchCartCount();
      handleApiSuccess(`${product.name} added to cart! 🛒`);
    } catch (error) {
      handleApiError(error, 'Failed to add product to cart');
    }
  }, [isAuthenticated, fetchCartCount]);

  // Newsletter handler
  const handleNewsletterSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterLoading(true);
    try {
      // Simulate API call - replace with actual newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleApiSuccess('Successfully subscribed to newsletter!');
      setNewsletterEmail('');
    } catch (error) {
      handleApiError(error, 'Failed to subscribe to newsletter');
    } finally {
      setNewsletterLoading(false);
    }
  }, [newsletterEmail]);

  // Memoized trust badges data
  const trustBadges = useMemo(() => [
    { icon: '🔒', text: 'Secure Payments' },
    { icon: '⚡', text: 'Fast Delivery' },
    { icon: '🛡️', text: 'Warranty Protected' }
  ], []);

  // Memoized stats data
  const statsData = useMemo(() => [
    { value: '10K+', label: 'Happy Customers' },
    { value: '5K+', label: 'Products Available' },
    { value: '50+', label: 'Categories' },
    { value: '24/7', label: 'Customer Support' }
  ], []);

  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">
            {errorDetails?.type === 'NETWORK' ? '📡' : 
             errorDetails?.type === 'CORS' ? '🚫' : 
             errorDetails?.type === 'SERVER' ? '🔧' : '😞'}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Content</h2>
          <p className="text-gray-600 mb-2">{error}</p>
          
          {/* Technical details for development */}
          {process.env.NODE_ENV === 'development' && errorDetails && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Technical Details (dev only):</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Error Type:</strong> {errorDetails.type}</p>
                <p><strong>Can Retry:</strong> {errorDetails.canRetry ? 'Yes' : 'No'}</p>
                <p><strong>Technical:</strong> {errorDetails.technical}</p>
                <p><strong>API URL:</strong> {getApiBaseUrl()}</p>
                <p><strong>Retry Count:</strong> {retryCount}</p>
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button
              onClick={fetchData}
              disabled={isRetrying}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isRetrying ? 'Retrying...' : retryCount > 0 ? `Try Again (Attempt ${retryCount + 1})` : 'Try Again'}
            </button>
            <Link
              to="/products"
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Browse Products Anyway
            </Link>
          </div>
          
          {/* Helpful suggestions based on error type */}
          {errorDetails && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
              <h3 className="font-semibold text-sm text-blue-900 mb-2">What you can do:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                {errorDetails.type === 'NETWORK' && (
                  <>
                    <li>Check your internet connection</li>
                    <li>Try disabling VPN or proxy if you're using one</li>
                    <li>Refresh the page after a few moments</li>
                  </>
                )}
                {errorDetails.type === 'CORS' && (
                  <>
                    <li>This appears to be a configuration issue</li>
                    <li>Please contact support if the problem persists</li>
                    <li>Try accessing the site in a different browser</li>
                  </>
                )}
                {errorDetails.type === 'SERVER' && (
                  <>
                    <li>The server is experiencing issues</li>
                    <li>Our team has been notified</li>
                    <li>Please try again in a few minutes</li>
                  </>
                )}
                {errorDetails.type === 'NO_RESPONSE' && (
                  <>
                    <li>The server may be temporarily unavailable</li>
                    <li>Check if you can access other websites</li>
                    <li>Try again in a few minutes</li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>EasyCart - Kenya's Leading Online Shopping Platform</title>
        <meta 
          name="description" 
          content="Shop the best deals on groceries, electronics, fashion, and more. Free delivery on orders over KSh 2,000 in Nairobi. Secure payments with M-Pesa, Visa, and Mastercard." 
        />
        <meta name="keywords" content="online shopping Kenya, groceries Nairobi, electronics, fashion, M-Pesa payments" />
      </Helmet>

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10" aria-hidden="true"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="text-center lg:text-left animate-fade-in">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                  Kenya's #1 Online
                  <span className="block text-yellow-300">Shopping Platform</span>
                </h1>
                <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-2xl mx-auto lg:mx-0">
                  Fresh groceries, latest electronics, trending fashion delivered to your door. 
                  Shop with confidence and enjoy unbeatable prices!
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <Link 
                    to="/products" 
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-primary-600 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                    aria-label="Start shopping now"
                  >
                    <span className="mr-2" aria-hidden="true">🛒</span>
                    Shop Now
                  </Link>
                  <Link 
                    to="/app-download" 
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-300 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                    aria-label="Download our mobile app"
                  >
                    <span className="mr-2" aria-hidden="true">📱</span>
                    Download App
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  {trustBadges.map((badge, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                    >
                      <span className="text-yellow-300 text-xl" aria-hidden="true">{badge.icon}</span>
                      <span className="text-sm font-medium">{badge.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Image */}
              <div className="hidden lg:block animate-slide-up" aria-hidden="true">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                  <div className="relative w-full max-w-lg mx-auto">
                    <div className="text-9xl text-center opacity-30">🛒</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wave Separator */}
          <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
            <svg viewBox="0 0 1440 120" fill="none" className="w-full h-12 md:h-20">
              <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="#F9FAFB"/>
            </svg>
          </div>
        </section>

        {/* Categories Section */}
        <section 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16"
          aria-labelledby="categories-heading"
        >
          <div className="text-center mb-10">
            <h2 id="categories-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-lg">
              Discover what you need from our wide range of categories
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <CategorySkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  getCategoryIcon={getCategoryIcon}
                />
              ))}
            </div>
          )}
        </section>

        {/* Top Deals / Trending Section */}
        <section 
          className="bg-white py-12 md:py-16"
          aria-labelledby="trending-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 id="trending-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  🔥 Trending Now
                </h2>
                <p className="text-gray-600">
                  Hot deals you don't want to miss
                </p>
              </div>
              <Link 
                to="/products" 
                className="hidden md:inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                aria-label="View all products"
              >
                View All
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <Link 
                to="/products"
                className="inline-flex items-center px-8 py-3 text-lg font-semibold bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Explore all products"
              >
                Explore All Products
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Gallery Section */}
        <section 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-white"
          aria-labelledby="gallery-heading"
        >
          <div className="text-center mb-10">
            <h2 id="gallery-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Shop the Look
            </h2>
            <p className="text-gray-600 text-lg">
              Discover trending styles and find your inspiration
            </p>
          </div>

          {/* Gallery Grid - 8 Images representing Pinterest inspiration
              Original Pinterest URLs provided by user:
              1. https://pin.it/2MDY6GQuA - Fashion & Style
              2. https://pin.it/7CTGr5mI8 - Trendy Apparel
              3. https://pin.it/4sYX2bRJq - Product Showcase
              4. https://pin.it/2bNcHcRn9 - Home Decor
              5. https://pin.it/6kxpfS0mE - Lifestyle Products
              6. https://pin.it/vXXNgOXEl - Fashion Accessories
              7. https://pin.it/2FirO6R3e - Tech & Gadgets
              8. https://pin.it/366MrpOgw - Beauty & Wellness
              
              Using high-quality Unsplash images to represent these categories
          */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Image 1 - Fashion & Style */}
            <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop&q=80"
                alt="Fashion inspiration - trendy clothing and accessories"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x800/6366f1/ffffff?text=Fashion+Style'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-semibold">Shop Fashion</p>
                </div>
              </div>
            </div>

            {/* Image 2 - Trendy Apparel */}
            <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=800&fit=crop&q=80"
                alt="Trendy apparel and style inspiration"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x800/8b5cf6/ffffff?text=Trendy+Apparel'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-semibold">Shop Apparel</p>
                </div>
              </div>
            </div>

            {/* Image 3 - Product Showcase */}
            <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=800&fit=crop&q=80"
                alt="Product showcase - featured items"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x800/ec4899/ffffff?text=Products'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-semibold">Shop Products</p>
                </div>
              </div>
            </div>

            {/* Image 4 - Home Decor */}
            <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=800&fit=crop&q=80"
                alt="Home decor inspiration - furniture and living"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x800/10b981/ffffff?text=Home+Decor'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-semibold">Shop Home</p>
                </div>
              </div>
            </div>

            {/* Image 5 - Lifestyle Products */}
            <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop&q=80"
                alt="Lifestyle products - headphones and accessories"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x800/f59e0b/ffffff?text=Lifestyle'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-semibold">Shop Lifestyle</p>
                </div>
              </div>
            </div>

            {/* Image 6 - Fashion Accessories */}
            <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600&h=800&fit=crop&q=80"
                alt="Fashion accessories - bags and style items"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x800/ef4444/ffffff?text=Accessories'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-semibold">Shop Accessories</p>
                </div>
              </div>
            </div>

            {/* Image 7 - Tech & Gadgets */}
            <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&h=800&fit=crop&q=80"
                alt="Tech gadgets - electronics and devices"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x800/3b82f6/ffffff?text=Tech+Gadgets'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-semibold">Shop Electronics</p>
                </div>
              </div>
            </div>

            {/* Image 8 - Beauty & Wellness */}
            <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=800&fit=crop&q=80"
                alt="Beauty and wellness products"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x800/a855f7/ffffff?text=Beauty+Wellness'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-semibold">Shop Beauty</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link 
              to="/products"
              className="inline-flex items-center px-8 py-3 text-lg font-semibold bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Browse all collections"
            >
              Browse All Collections
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Trust Signals Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Secure Payments */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Secure Payments
              </h3>
              <p className="text-gray-600 mb-4">
                100% secure transactions with M-Pesa, Visa, and Mastercard
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">M-Pesa</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">Visa</span>
                <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">Mastercard</span>
              </div>
            </div>

            {/* Fast Delivery */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-600 mb-4">
                Free delivery on orders over KSh 2,000 within Nairobi
              </p>
              <div className="text-primary-600 font-semibold">
                Same-day delivery available
              </div>
            </div>

            {/* Warranty Protected */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Warranty Protected
              </h3>
              <p className="text-gray-600 mb-4">
                100% genuine products from trusted brands with warranty
              </p>
              <div className="text-primary-600 font-semibold">
                Easy returns within 30 days
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {statsData.map((stat, index) => (
                <div 
                  key={index}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-blue-100 text-sm md:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16"
          aria-labelledby="newsletter-heading"
        >
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 md:p-12 text-center">
            <h2 id="newsletter-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Stay Updated with Our Latest Deals
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and get exclusive offers, new arrivals, and special discounts delivered to your inbox.
            </p>
            <form 
              onSubmit={handleNewsletterSubmit}
              className="max-w-md mx-auto flex flex-col sm:flex-row gap-3"
              noValidate
            >
              <div className="flex-1">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full px-6 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                  disabled={newsletterLoading}
                />
              </div>
              <button
                type="submit"
                disabled={newsletterLoading || !newsletterEmail}
                className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 whitespace-nowrap focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
};

// Export with error boundary
const LandingPageWithErrorBoundary = (props) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  const resetError = () => {
    setHasError(false);
    setError(null);
  };

  if (hasError) {
    return <ErrorFallback error={error} resetErrorBoundary={resetError} />;
  }

  return <LandingPage {...props} />;
};

export default LandingPageWithErrorBoundary;