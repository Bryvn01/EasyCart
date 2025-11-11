import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { productsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';
import ProductCard from './ui/ProductCard';
import CategoryCard from './ui/CategoryCard';
import { ProductGridSkeleton, CategoryGridSkeleton } from './ui/LoadingSkeleton';

const EnhancedHomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { isAuthenticated } = useAuth();
  const { fetchCartCount } = useCart();

  const { data: products = [], isLoading: productsLoading, isError, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await productsAPI.getProducts();
      return res.data.results || res.data || [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await productsAPI.getCategories();
      return res.data.results || res.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

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

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_name === selectedCategory)
    : products;

  const trendingProducts = products.filter(p => p.is_top_seller || p.is_flash_sale).slice(0, 12);

  if (isError) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Products</h3>
          <p className="text-gray-600 mb-6">{error?.message || 'Please try again later'}</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>EasyCart - Kenya's Leading Online Supermarket | Shop Groceries, Electronics & More</title>
        <meta name="description" content="Shop online at EasyCart Kenya. Get fresh groceries, electronics, fashion, and more delivered to your door. Free delivery on orders over KSh 2,000 in Nairobi." />
      </Helmet>

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-primary to-green-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container mx-auto max-w-7xl px-4 py-16 md:py-24 relative z-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6 animate-fade-in">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                  Kenya's #1 Online Shopping Platform
                </h1>
                <p className="text-xl md:text-2xl text-blue-50">
                  Fresh groceries, latest electronics, trending fashion delivered to your door
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="/products"
                    className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
                  >
                    Shop Now 🛒
                  </a>
                  <a
                    href="/products"
                    className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition"
                  >
                    Browse Deals
                  </a>
                </div>
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <span className="text-2xl">✓</span>
                    <span className="font-medium">M-Pesa Secure</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <span className="text-2xl">✓</span>
                    <span className="font-medium">Same-Day Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <span className="text-2xl">✓</span>
                    <span className="font-medium">100% Fresh</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <img
                  src="/images/hero-shopping.svg"
                  alt="Happy shopping"
                  className="w-full max-w-lg mx-auto drop-shadow-2xl"
                  loading="eager"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="container mx-auto max-w-7xl px-4 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
            <p className="text-gray-600">Browse our wide selection of products</p>
          </div>

          {categoriesLoading ? (
            <CategoryGridSkeleton count={12} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 12).map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => setSelectedCategory(category.name)}
                  isSelected={selectedCategory === category.name}
                />
              ))}
            </div>
          )}
        </section>

        {/* Trending Products */}
        <section className="container mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Trending Products</h2>
              <p className="text-gray-600">Hot deals and bestsellers</p>
            </div>
            <a href="/products" className="text-primary font-semibold hover:underline">
              View All →
            </a>
          </div>

          {productsLoading ? (
            <ProductGridSkeleton count={12} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trendingProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </section>

        {/* All Products */}
        <section className="container mx-auto max-w-7xl px-4 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedCategory ? `${selectedCategory} Products` : 'All Products'}
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-primary font-semibold hover:underline"
              >
                ← Back to all products
              </button>
            )}
          </div>

          {productsLoading ? (
            <ProductGridSkeleton count={18} />
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-6">Try selecting a different category</p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
              >
                View All Products
              </button>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto max-w-7xl px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Shop With EasyCart?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">🚚</div>
                <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
                <p className="text-gray-600">
                  Free delivery on orders over KSh 2,000 in Nairobi. Same-day delivery available.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
                <p className="text-gray-600">
                  M-Pesa, Visa, Mastercard, and more. Your payment is 100% secure.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-xl font-bold mb-2">Quality Guarantee</h3>
                <p className="text-gray-600">
                  100% genuine products from trusted brands. Fresh guarantee on all groceries.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default EnhancedHomePage;
