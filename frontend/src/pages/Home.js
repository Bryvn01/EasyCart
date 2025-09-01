import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productsAPI, ordersAPI } from '../services/api';
import heroBanner from '../assets/hero-banner.jpg';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { fetchCartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productsAPI.getProducts({ limit: 8 });
      const productsData = response.data.results || response.data;
      setFeaturedProducts(Array.isArray(productsData) ? productsData.slice(0, 8) : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      const categoriesData = response.data.results || response.data;
      setCategories(Array.isArray(categoriesData) ? categoriesData.slice(0, 6) : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const addToCart = async (productId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await ordersAPI.addToCart({ product_id: productId, quantity: 1 });
      fetchCartCount();
      toast.success('Product added to cart! 🛒');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div>
      {/* Modern Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-50 to-indigo-50 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Kenya's #1 Online Supermarket
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Fresh Groceries 
                <span className="text-blue-600 block">Delivered Fast</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Get fresh produce, daily essentials, and quality Kenyan groceries delivered to your doorstep in under 30 minutes.
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
                >
                  Shop Now
                </Link>
                <Link
                  to="/products"
                  className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-semibold text-center"
                >
                  View Deals
                </Link>
              </div>
              
              {/* Features */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{t('freeDelivery', 'Free delivery over KES 1000')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{t('sameDayDelivery', 'Same day delivery')}</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <img 
                src={heroBanner} 
                alt="Fresh groceries and produce" 
                className="w-full h-auto rounded-2xl shadow-lg"
              />
              <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Save up to 40%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group text-center hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="bg-gray-100 rounded-2xl p-6 mb-4 group-hover:bg-blue-50 transition-colors">
                  <div className="text-4xl mb-2">🛒</div>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products" className="text-blue-600 hover:text-blue-700 font-semibold">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{product.description?.substring(0, 60)}...</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">KES {product.price}</span>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
            Why Choose Easycart?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gray-50 hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-3xl">🛒</div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">{t('qualityProducts', 'Quality Products')}</h3>
              <p className="text-gray-600 leading-relaxed">
                Authentic Kenyan products from trusted local suppliers and brands.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gray-50 hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-3xl">🚚</div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">{t('fastDelivery', 'Fast Delivery')}</h3>
              <p className="text-gray-600 leading-relaxed">
                Quick and reliable delivery across Kenya with real-time tracking.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gray-50 hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-3xl">💳</div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">{t('securePayment', 'Secure Payment')}</h3>
              <p className="text-gray-600 leading-relaxed">
                Safe and secure payment options including M-Pesa integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied customers across Kenya
          </p>
          <Link 
            to="/products" 
            className="inline-block px-12 py-4 bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;