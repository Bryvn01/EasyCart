import React, { useState, useEffect } from 'react';
import ProductGrid from './ProductGrid';
import CategoryNav from './CategoryNav';
import BannerCarousel from './BannerCarousel';
import WhatsAppButton from './WhatsAppButton';
import { productsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';
import { optimizeImage, imageFallback } from '../utils/images';

import { Helmet } from 'react-helmet-async';

const sectionMap = [
  { title: 'Flash Sales', filter: p => p.is_flash_sale },
  { title: 'Grocery Essentials', filter: p => p.category_name === 'Groceries' },
  { title: 'TV Deals', filter: p => p.category_name?.toLowerCase().includes('tv') || p.category_name?.toLowerCase().includes('electronic') },
  { title: 'Phone Deals', filter: p => p.category_name?.toLowerCase().includes('phone') || p.category_name?.toLowerCase().includes('electronic') },
  { title: 'Beauty & Baby', filter: p => p.category_name?.toLowerCase().includes('beauty') || p.category_name?.toLowerCase().includes('baby') },
];

const Homepage = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { fetchCartCount } = useCart();

  // Fetch products from backend
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getProducts();
      setProducts(res.data.results || res.data || []);
    } catch (error) {
      handleApiError(error, 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Refetch products after admin CRUD (optional: use context/event for real-time)
  useEffect(() => {
    const handleProductsUpdated = () => fetchProducts();
    window.addEventListener('easycart-products-updated', handleProductsUpdated);
    return () => window.removeEventListener('easycart-products-updated', handleProductsUpdated);
  }, []);

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

  const renderSection = (section) => {
    const filtered = products.filter(section.filter);
    if (loading) {
      return (
        <section key={section.title} className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">{section.title}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse h-64" />
            ))}
          </div>
        </section>
      );
    }
    if (!filtered.length) return null;
    return (
      <section key={section.title} className="mb-10" id={section.title.replace(/\s/g, '-')}> {/* For scroll-to-section */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">{section.title}</h2>
          <a href={`/${section.title.toLowerCase().replace(/\s/g, '-')}`} className="text-primary text-sm hover:underline">See All</a>
        </div>
        <ProductGrid products={filtered.slice(0, 10)} onAddToCart={handleAddToCart} loading={loading} />
      </section>
    );
  };

  // Category filtering for nav bar
  const categorySections = {
    'Flash Sales': sectionMap[0],
    'Grocery Essentials': sectionMap[1],
    'TV Deals': sectionMap[2],
    'Phone Deals': sectionMap[3],
    'Beauty & Baby': sectionMap[4],
  };
  // Scroll to section when category selected
  useEffect(() => {
    if (selectedCategory && document.getElementById(selectedCategory.replace(/\s/g, '-'))) {
      document.getElementById(selectedCategory.replace(/\s/g, '-')).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedCategory]);

  return (
    <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8" role="main">
      <Helmet>
        <title>EasyCart - Kenya's Leading Online Supermarket</title>
        <meta name="description" content="Shop groceries, electronics, fashion, and more. Fast delivery, best prices, and trusted brands in Kenya." />
      </Helmet>
      
      {/* Enhanced Hero Section with Better Images */}
      <section className="relative flex flex-col md:flex-row items-center justify-between gap-8 py-12 md:py-20 px-6 md:px-12 bg-gradient-to-br from-primary-50 via-blue-50 to-green-50 rounded-2xl shadow-lg mb-8 overflow-hidden">
        <div className="z-10 max-w-xl">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Kenya's #1 Online Shopping Platform
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-6">
            Fresh groceries, latest electronics, trending fashion delivered to your door. Shop with confidence!
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <a href="/products" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition text-base">
              Shop Now 🛒
            </a>
            <a href="/products" className="inline-block bg-white hover:bg-gray-50 text-primary-600 font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition border-2 border-primary-600 text-base">
              Download App 📱
            </a>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
              <img src="/icons/secure-payment.svg" alt="Secure Payment" className="w-5 h-5" onError={(e) => imageFallback(e, 'icon')} />
              <span className="text-sm font-medium text-gray-700">M-Pesa Secure</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
              <img src="/icons/fast-delivery.svg" alt="Fast Delivery" className="w-5 h-5" onError={(e) => imageFallback(e, 'icon')} />
              <span className="text-sm font-medium text-gray-700">Same-Day Nairobi</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
              <img src="/icons/fresh-guarantee.svg" alt="Fresh Guarantee" className="w-5 h-5" onError={(e) => imageFallback(e, 'icon')} />
              <span className="text-sm font-medium text-gray-700">100% Fresh Guarantee</span>
            </div>
          </div>
        </div>
        <div className="hidden md:block absolute right-0 bottom-0 z-0">
          <img 
            src="https://images.pexels.com/photos/9705823/pexels-photo-9705823.jpeg?auto=compress&cs=tinysrgb&w=800" 
            alt="Shopping cart filled with fresh groceries and produce" 
            className="w-96 max-w-xs md:max-w-md lg:max-w-lg opacity-90 rounded-lg shadow-xl" 
            loading="lazy"
            onError={(e) => imageFallback(e, 'hero')}
          />
        </div>
      </section>

      <BannerCarousel />
      
      {/* Sticky Category Bar */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
        <CategoryNav
          onSelectCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* Deals Carousel/Section */}
      <section className="my-8">
        <h2 className="text-2xl font-bold mb-4">Today's Deals</h2>
        <ProductGrid products={products.filter(p => p.is_flash_sale).slice(0, 10)} onAddToCart={handleAddToCart} loading={loading} />
      </section>

      {/* Full Product Grid */}
      <section className="my-8">
        <h2 className="text-2xl font-bold mb-4">All Products</h2>
        <ProductGrid products={selectedCategory ? products.filter(categorySections[selectedCategory]?.filter || (() => true)) : products} onAddToCart={handleAddToCart} loading={loading} />
      </section>

      {/* Top Picks Section */}
      <section className="my-8">
        <h2 className="text-xl font-semibold mb-4">Top Picks</h2>
        <ProductGrid products={products.filter(p => p.is_top_seller).slice(0, 8)} onAddToCart={handleAddToCart} loading={loading} />
      </section>

      {/* Essentials Section */}
      <section className="my-8">
        <h2 className="text-xl font-semibold mb-4">Essentials</h2>
        <ProductGrid products={products.filter(p => p.category_name && ['Groceries', 'Baby & Kids', 'Beauty & Personal Care', 'Essentials'].some(cat => p.category_name.includes(cat))).slice(0, 8)} onAddToCart={handleAddToCart} loading={loading} />
      </section>

      {/* Popular in Selected Category */}
      {selectedCategory && (
        <section className="my-8">
          <h2 className="text-xl font-semibold mb-4">Popular in {selectedCategory}</h2>
          <ProductGrid products={products.filter(categorySections[selectedCategory]?.filter || (() => true)).slice(0, 8)} onAddToCart={handleAddToCart} loading={loading} />
        </section>
      )}

      {/* Optionally render all sections below main one */}
      <div className="hidden md:block">
        {sectionMap.map(renderSection)}
      </div>

      {/* Enhanced Payment Methods & Delivery Promise Section */}
      <section className="my-12 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 md:p-8" aria-label="Payment and Delivery">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">We Accept</h3>
          <div className="flex flex-wrap justify-center gap-4 items-center">
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2 hover:shadow-md transition-shadow">
              <img src="/icons/mpesa-logo.png" alt="M-Pesa" className="w-8 h-8" onError={(e) => imageFallback(e, 'icon')} />
              <span className="font-semibold text-green-700">M-Pesa</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2 hover:shadow-md transition-shadow">
              <img src="/icons/visa-logo.png" alt="Visa" className="w-8 h-8" onError={(e) => imageFallback(e, 'icon')} />
              <span className="font-semibold text-blue-700">Visa</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2 hover:shadow-md transition-shadow">
              <img src="/icons/mastercard-logo.png" alt="Mastercard" className="w-8 h-8" onError={(e) => imageFallback(e, 'icon')} />
              <span className="font-semibold text-red-700">Mastercard</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2 hover:shadow-md transition-shadow">
              <img src="/icons/airtel-money-logo.png" alt="Airtel Money" className="w-8 h-8" onError={(e) => imageFallback(e, 'icon')} />
              <span className="font-semibold text-orange-700">Airtel Money</span>
            </div>
          </div>
        </div>
        <div className="text-center border-t border-gray-200 pt-6">
          <p className="text-lg font-semibold text-gray-800 mb-4">
            🚚 Free delivery on orders over <span className="text-primary-600 font-bold">KSh 2,000</span> in Nairobi
          </p>
          <p className="text-sm text-gray-600">Same-day delivery available for orders placed before 2 PM</p>
        </div>
      </section>

      {/* Enhanced Trust badges with Icons */}
      <section className="flex flex-wrap gap-4 justify-center my-12" aria-label="Trust Badges">
        <div className="flex items-center gap-2 bg-white border rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <img src="/icons/verified-store.svg" alt="Verified Store" className="w-6 h-6" onError={(e) => imageFallback(e, 'icon')} />
          <span className="text-sm font-medium text-gray-700">Official Store</span>
        </div>
        <div className="flex items-center gap-2 bg-white border rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <img src="/icons/warranty.svg" alt="Warranty Protected" className="w-6 h-6" onError={(e) => imageFallback(e, 'icon')} />
          <span className="text-sm font-medium text-gray-700">Warranty Protected</span>
        </div>
        <div className="flex items-center gap-2 bg-white border rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <img src="/icons/fast-delivery.svg" alt="Fast Delivery" className="w-6 h-6" onError={(e) => imageFallback(e, 'icon')} />
          <span className="text-sm font-medium text-gray-700">Fast Delivery</span>
        </div>
        <div className="flex items-center gap-2 bg-white border rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <img src="/icons/happy-customers.svg" alt="Happy Customers" className="w-6 h-6" onError={(e) => imageFallback(e, 'icon')} />
          <span className="text-sm font-medium text-gray-700">5000+ Happy Customers</span>
        </div>
      </section>

      {/* WhatsApp Support Button */}
      <WhatsAppButton />
    </main>
  );
};

export default Homepage;