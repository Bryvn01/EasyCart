import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const { isAuthenticated } = useAuth();
  const { fetchCartCount } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getProducts(),
        productsAPI.getCategories()
      ]);
      
      const productsData = productsRes.data.results || productsRes.data || [];
      const categoriesData = categoriesRes.data.results || categoriesRes.data || [];
      
      setProducts(productsData);
      setCategories(categoriesData.slice(0, 6)); // Top 6 categories
      
      // Featured products: top sellers or random selection
      const featured = productsData
        .filter(p => p.stock > 0)
        .sort((a, b) => (b.is_top_seller ? 1 : 0) - (a.is_top_seller ? 1 : 0))
        .slice(0, 8);
      setFeaturedProducts(featured);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
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
  };

  const getCategoryIcon = (name) => {
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
      </Helmet>

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
          
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
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-primary-600 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <span className="mr-2">🛒</span>
                    Shop Now
                  </Link>
                  <Link 
                    to="/products" 
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-300"
                  >
                    <span className="mr-2">📱</span>
                    Download App
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-yellow-300 text-xl">🔒</span>
                    <span className="text-sm font-medium">Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-yellow-300 text-xl">⚡</span>
                    <span className="text-sm font-medium">Fast Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-yellow-300 text-xl">🛡️</span>
                    <span className="text-sm font-medium">Warranty Protected</span>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="hidden lg:block animate-slide-up">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                  <img 
                    src="/images/hero-shopping.png" 
                    alt="Happy family shopping online" 
                    className="relative w-full max-w-lg mx-auto drop-shadow-2xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Wave Separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 md:h-20">
              <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="#F9FAFB"/>
            </svg>
          </div>
        </section>

        {/* Categories Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-lg">
              Discover what you need from our wide range of categories
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                >
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {getCategoryIcon(category.name)}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 text-center group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Top Deals / Trending Section */}
        <section className="bg-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  🔥 Trending Now
                </h2>
                <p className="text-gray-600">
                  Hot deals you don't want to miss
                </p>
              </div>
              <Link 
                to="/products" 
                className="hidden md:inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                View All
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl animate-pulse h-80"></div>
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
                className="inline-flex items-center px-8 py-3 text-lg font-semibold bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 hover:shadow-lg transition-all duration-300"
              >
                Explore All Products
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Trust Signals Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Secure Payments */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
              <div className="animate-fade-in">
                <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
                <div className="text-blue-100 text-sm md:text-base">Happy Customers</div>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="text-4xl md:text-5xl font-bold mb-2">5K+</div>
                <div className="text-blue-100 text-sm md:text-base">Products Available</div>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
                <div className="text-blue-100 text-sm md:text-base">Categories</div>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
                <div className="text-blue-100 text-sm md:text-base">Customer Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Stay Updated with Our Latest Deals
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and get exclusive offers, new arrivals, and special discounts delivered to your inbox.
            </p>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
                aria-label="Email address"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-300 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
};

// Enhanced Product Card Component
const ProductCard = ({ product, onAddToCart }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {!imageError && (product.image || product.image_url) ? (
            <img
              src={product.image || product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              📦
            </div>
          )}
          
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                Out of Stock
              </span>
            </div>
          )}

          {product.is_flash_sale && (
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
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors min-h-[3rem]" title={product.name}>
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mb-3">
          <div className="text-xl font-bold text-gray-900">
            KSh {product.price?.toLocaleString() || '0'}
          </div>
          {product.stock > 0 && product.stock < 10 && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
              Only {product.stock} left
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            onAddToCart(product);
          }}
          disabled={product.stock === 0}
          className="w-full py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
