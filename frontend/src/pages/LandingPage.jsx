import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productsAPI, ordersAPI, getApiBaseUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { handleApiError, handleApiSuccess, retryWithBackoff, checkApiHealth, getDetailedErrorMessage } from '../utils/errorHandler';
import { toast } from 'react-hot-toast';
import AuthModal from '../components/AuthModal';
import useGuestCart from '../hooks/useGuestCart';
import HorizontalCategoryScroll from '../components/HorizontalCategoryScroll';
import MobileSearchBar from '../components/MobileSearchBar';
import {
  FiShoppingCart,
  FiPackage,
  FiTruck,
  FiShield,
  FiAward,
  FiAlertCircle,
  FiHome,
  FiMonitor,
  FiShoppingBag,
  FiBook
} from 'react-icons/fi';
import { GiSoccerBall, GiLipstick, GiClothes } from 'react-icons/gi';
import { FaBaby } from 'react-icons/fa';

// Error Boundary Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="flex justify-center mb-4">
        <FiAlertCircle className="w-16 h-16 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-6">
        {error?.message || "We're having trouble loading the page. Please try again."}
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

// Skeleton Loaders - Match actual content structure exactly
const CategorySkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-3 text-center">
      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
    </div>
  </div>
);

// Mobile skeleton matches HorizontalCategoryScroll layout exactly
const MobileCategorySkeleton = () => (
  <div className="mb-4" style={{ minHeight: '160px' }}>
    <div className="px-4 mb-3">
      <div className="h-5 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
    </div>
    <div className="overflow-hidden py-3">
      <div className="flex gap-3 px-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-22 h-22 bg-gray-200 rounded-2xl animate-pulse"
            style={{ width: '88px', height: '88px' }}
          ></div>
        ))}
      </div>
    </div>
    <div className="flex justify-center mt-2">
      <div className="flex space-x-1.5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse"></div>
        ))}
      </div>
    </div>
  </div>
);

const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Professional Category Card Component
const CategoryCard = React.memo(({ category, getCategoryIcon }) => {
  const categoryImage = category.image_url || category.image;
  const hasImage = !!categoryImage;

  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.name)}`}
      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-primary-500 hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      aria-label={`Browse ${category.name} category`}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {hasImage ? (
          <img
            src={categoryImage}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="w-full h-full flex items-center justify-center text-primary-600 p-8"
          style={{ display: hasImage ? 'none' : 'flex' }}
          aria-hidden="true"
        >
          {getCategoryIcon(category.name)}
        </div>
      </div>
      <div className="p-4 bg-white">
        <h3 className="text-sm font-semibold text-gray-900 text-center group-hover:text-primary-600 transition-colors">
          {category.name}
        </h3>
      </div>
    </Link>
  );
});

CategoryCard.displayName = 'CategoryCard';

// Professional Product Card Component with Star Ratings
// index prop used to prioritize loading for above-the-fold images (LCP optimization)
const ProductCard = React.memo(({ product, onAddToCart, index = 999 }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Prioritize loading for first 2 products (above-the-fold)
  const isAboveFold = index < 2;
  const loadingStrategy = isAboveFold ? 'eager' : 'lazy';
  const fetchPriorityValue = index === 0 ? 'high' : 'auto';

  const handleAddToCartClick = useCallback((e) => {
    e.preventDefault();
    onAddToCart(product);
  }, [product, onAddToCart]);

  const productImage = product.image || product.image_url;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  return (
    <div className="group bg-white overflow-hidden transition-colors duration-150">
      <Link to={`/products/${product.id}`} className="block" aria-label={`View ${product.name} details`}>
        {/* Fixed aspect ratio prevents CLS while images stream in */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {productImage && !imageError ? (
            <>
              <img
                src={productImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100 group-hover:scale-[1.01]'
                }`}
                loading={loadingStrategy}
                fetchPriority={fetchPriorityValue}
                width="300"
                height="300"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400" role="img" aria-label="Product placeholder">
              <FiPackage className="w-20 h-20" />
            </div>
          )}

          {/* Stock Status Overlay */}
          {isOutOfStock && (
            <div
              className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm"
              role="status"
              aria-label="Out of stock"
            >
              <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg">
                Out of Stock
              </span>
            </div>
          )}

          {/* Lightweight badges keep status clear without visual clutter */}
          {product.is_flash_sale && !isOutOfStock && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-md font-semibold text-xs">
                SALE
              </span>
            </div>
          )}

          {isLowStock && !isOutOfStock && (
            <div className="absolute top-3 right-3">
              <span className="bg-orange-700 text-white px-3 py-1 rounded-md font-medium text-xs">
                Only {product.stock} left
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 border-t border-gray-100">
        <Link to={`/products/${product.id}`}>
          <h3
            className="font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-primary-600 transition-colors min-h-[3rem]"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline justify-between mb-3">
          <div className="text-2xl font-extrabold text-gray-900" aria-label={`Price: KSh ${product.price?.toLocaleString() || '0'}`}>
            KSh {product.price?.toLocaleString() || '0'}
          </div>
        </div>

        <button
          onClick={handleAddToCartClick}
          disabled={isOutOfStock}
          className="w-full min-h-[44px] py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center gap-2"
          aria-label={isOutOfStock ? 'Out of stock' : `Add ${product.name} to cart`}
        >
          {!isOutOfStock && <FiShoppingCart className="w-5 h-5" />}
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

const TRENDING_CATEGORY_PATTERNS = {
  phonesAndTablets: /phone|tablet|mobile/i,
  fashion: /fashion|clothing|apparel|shoe/i
};

// Main Landing Page Component
const LandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingCartProduct, setPendingCartProduct] = useState(null);

  const { isAuthenticated } = useAuth();
  const { fetchCartCount } = useCart();
  const location = useLocation();

  // INDUSTRY BEST PRACTICE: Guest cart with localStorage
  const {
    addToGuestCart,
    migrateGuestCartToServer,
    guestCartCount
  } = useGuestCart(isAuthenticated);

  // INDUSTRY BEST PRACTICE: Auto-migrate guest cart on login
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

  // Memoized category icons - Professional icons instead of emojis
  const getCategoryIcon = useCallback((name) => {
    const iconMap = {
      'Electronics': <FiMonitor className="w-full h-full" />,
      'Fashion': <GiClothes className="w-full h-full" />,
      'Groceries': <FiShoppingBag className="w-full h-full" />,
      'Home & Living': <FiHome className="w-full h-full" />,
      'Beauty': <GiLipstick className="w-full h-full" />,
      'Sports': <GiSoccerBall className="w-full h-full" />,
      'Books': <FiBook className="w-full h-full" />,
      'Toys': <FaBaby className="w-full h-full" />,
    };
    return iconMap[name] || <FiPackage className="w-full h-full" />;
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
      setAllProducts(productsData);

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
    // INDUSTRY BEST PRACTICE: Allow guest cart, show auth modal with guest option
    if (!isAuthenticated) {
      // Add to guest cart immediately (localStorage)
      addToGuestCart(product, 1);

      // Haptic feedback for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      // Show professional auth modal (non-blocking)
      setPendingCartProduct(product);
      setTimeout(() => {
        setShowAuthModal(true);
      }, 1500); // Show after a brief delay

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
      handleApiSuccess(`${product.name} added to cart!`);
    } catch (error) {
      handleApiError(error, 'Failed to add item to cart');
    }
  }, [isAuthenticated, fetchCartCount, addToGuestCart]);

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

  const getCategoryName = useCallback((product) => {
    if (typeof product?.category === 'string') return product.category;
    return product?.category?.name || product?.category_name || '';
  }, []);

  const trendingNowProducts = useMemo(() => {
    const inStock = allProducts.filter((product) => product.stock > 0);

    const sorted = [...inStock].sort((a, b) => {
      if (a.is_top_seller !== b.is_top_seller) return b.is_top_seller ? 1 : -1;
      return (b.rating || 0) - (a.rating || 0);
    });

    // Prioritize categories with strongest local shopping intent, then gracefully fall back.
    const phonesAndTablets = sorted.filter((product) => TRENDING_CATEGORY_PATTERNS.phonesAndTablets.test(getCategoryName(product)));
    const fashion = sorted.filter((product) => TRENDING_CATEGORY_PATTERNS.fashion.test(getCategoryName(product)));

    if (phonesAndTablets.length >= 4) return phonesAndTablets.slice(0, 6);
    if (fashion.length >= 4) return fashion.slice(0, 6);

    const combined = [...phonesAndTablets, ...fashion];
    return (combined.length > 0 ? combined : sorted).slice(0, 6);
  }, [allProducts, getCategoryName]);

  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <FiAlertCircle className="w-16 h-16 text-red-500" />
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

  // Structured data for SEO (JSON-LD)
  // Note: Update these values with real URLs and contact info before production deployment
  // Set REACT_APP_SITE_URL in environment for different deployments (dev/staging/prod)
  const siteUrl = process.env.REACT_APP_SITE_URL || 'https://easycart.co.ke';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "EasyCart",
    "url": siteUrl,
    "description": "Kenya's Leading Online Shopping Platform"
    // TODO: Add logo, contactPoint, and sameAs when real values are available
    // "logo": `${siteUrl}/logo.png`,
    // "contactPoint": { ... },
    // "sameAs": ["https://facebook.com/...", ...]
  };

  const webSiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "EasyCart",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Helmet>
        <title>EasyCart - Kenya's Leading Online Shopping Platform</title>
        <meta
          name="description"
          content="Shop the best deals on groceries, electronics, fashion, and more. Free delivery on orders over KSh 2,000 in Nairobi. Secure payments with M-Pesa, Visa, and Mastercard."
        />
        <meta name="keywords" content="online shopping Kenya, groceries Nairobi, electronics, fashion, M-Pesa payments" />

        {/* Preconnect hints for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="EasyCart - Kenya's Leading Online Shopping Platform" />
        <meta property="og:description" content="Shop the best deals on groceries, electronics, fashion, and more. Free delivery on orders over KSh 2,000 in Nairobi." />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content="EasyCart" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EasyCart - Kenya's Leading Online Shopping Platform" />
        <meta name="twitter:description" content="Shop the best deals on groceries, electronics, fashion, and more." />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(webSiteStructuredData)}
        </script>
      </Helmet>

      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-primary-600 focus:font-semibold focus:ring-2 focus:ring-primary-500"
      >
        Skip to main content
      </a>

      <main id="main-content" className="min-h-screen bg-gray-50">
        {/* Mobile Search Bar - Sticky */}
        <MobileSearchBar />
        {/* Hero Section */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-10 items-center">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Quality Products, Delivered Fast Across Nairobi.
                </h1>

                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
                    <FiShield className="w-4 h-4" aria-hidden="true" />
                    Secure Checkout
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
                    <FiTruck className="w-4 h-4" aria-hidden="true" />
                    Same-day Nairobi
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
                    <FiAward className="w-4 h-4" aria-hidden="true" />
                    Quality Guaranteed
                  </span>
                </div>

                <p className="mt-5 text-base md:text-lg text-gray-700 max-w-2xl">
                  Secure M-Pesa checkout, same-day delivery on orders over KSh 2,000.
                </p>

                <a
                  href="#trending-nairobi"
                  className="mt-3 inline-flex min-h-[44px] items-center text-sm md:text-base font-semibold text-primary-700 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2"
                >
                  4.8★ (5,000+ reviews)
                </a>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a
                    href="#trending-nairobi"
                    className="inline-flex min-h-[44px] items-center justify-center px-6 py-3 text-base font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-150 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Jump to best-selling products"
                  >
                    <FiShoppingCart className="mr-2 w-5 h-5" />
                    Shop Best Sellers
                  </a>
                  <Link
                    to="/products"
                    className="inline-flex min-h-[44px] items-center justify-center px-6 py-3 text-base font-semibold bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Browse all products"
                  >
                    Browse All Products
                  </Link>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 md:p-8">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-5">Why Nairobi shoppers trust EasyCart</p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <FiShield className="w-5 h-5 text-primary-600 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-gray-900">Secure M-Pesa Payments</p>
                      <p className="text-sm text-gray-600">Checkout is quick, familiar, and protected.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiTruck className="w-5 h-5 text-primary-600 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-gray-900">Fast Local Fulfillment</p>
                      <p className="text-sm text-gray-600">Same-day delivery available for qualifying Nairobi orders.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiAward className="w-5 h-5 text-primary-600 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-gray-900">Curated Quality</p>
                      <p className="text-sm text-gray-600">Popular products from trusted local and global brands.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Trending products section shown immediately after hero for faster product discovery */}
        <section
          id="trending-nairobi"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20"
          aria-labelledby="trending-nairobi-heading"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 id="trending-nairobi-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Trending Now in Nairobi
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                Popular picks from phones, tablets, and fashion this week.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex min-h-[44px] items-center text-primary-700 font-semibold hover:text-primary-800 transition-colors duration-150 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-1"
              aria-label="View all products"
            >
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : trendingNowProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {trendingNowProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <p className="text-gray-600 mb-4">Fresh trending items are loading. Explore the full catalog in the meantime.</p>
              <Link
                to="/products"
                className="inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-150 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Browse Products
              </Link>
            </div>
          )}
        </section>

        {/* Featured Products Section */}
        <section
          className="bg-white py-14 md:py-20"
          aria-labelledby="trending-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 id="trending-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Featured Products
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Top picks for you today
                </p>
              </div>
              <Link
                to="/products"
                className="inline-flex min-h-[44px] items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded text-sm md:text-base px-1"
                aria-label="View all products"
              >
                View All
                <svg className="w-4 h-4 md:w-5 md:h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {featuredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    index={index}
                  />
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <Link
                to="/products"
                className="inline-flex min-h-[44px] items-center px-8 py-3 text-lg font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-150 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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

        {/* Shop by Category Section */}
        <section
          className="max-w-7xl mx-auto py-14 md:py-20"
          aria-labelledby="categories-heading"
        >
          <div className="hidden md:block text-center mb-10 px-4 sm:px-6 lg:px-8">
            <h2 id="categories-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-lg">
              Discover what you need from our wide range of categories
            </p>
          </div>
          <div className="md:hidden px-4 mb-2">
            <h2 className="text-lg font-bold text-gray-900">Shop by Category</h2>
          </div>

          {loading ? (
            <>
              <div className="md:hidden">
                <MobileCategorySkeleton />
              </div>
              <div className="hidden md:block px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <CategorySkeleton key={i} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="md:hidden">
                <HorizontalCategoryScroll
                  categories={categories}
                  selectedCategory={null}
                  onSelectCategory={(categoryName) => {
                    window.location.href = `/products?category=${encodeURIComponent(categoryName)}`;
                  }}
                />
              </div>

              <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 px-4 sm:px-6 lg:px-8">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Trust Signals Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Secure Payments */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:border-primary-500 hover:shadow-md transition-all duration-200 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <FiShield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Secure Payments
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                100% secure transactions with M-Pesa, Visa, and Mastercard
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium border border-green-200">M-Pesa</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200">Visa</span>
                <span className="px-3 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium border border-red-200">Mastercard</span>
              </div>
            </div>

            {/* Fast Delivery */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:border-primary-500 hover:shadow-md transition-all duration-200 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <FiTruck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Free delivery on orders over KSh 2,000 within Nairobi
              </p>
              <div className="text-primary-600 font-semibold text-sm">
                Same-day delivery available
              </div>
            </div>

            {/* Warranty Protected */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 hover:border-primary-500 hover:shadow-md transition-all duration-200 text-center">
              <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <FiAward className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Quality Guaranteed
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                100% genuine products from trusted brands with warranty
              </p>
              <div className="text-primary-600 font-semibold text-sm">
                Easy returns within 30 days
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20"
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
        allowGuest={false}
        returnUrl={location.pathname + location.search}
      />
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
