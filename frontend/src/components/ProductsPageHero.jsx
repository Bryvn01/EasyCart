import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ProductsPageHero - Hero banner for the Products page
 * 
 * Features:
 * - Promotional banner with gradient background
 * - Featured categories quick links
 * - Responsive design (mobile-first)
 * - Accessibility compliant
 */
const ProductsPageHero = ({ selectedCategory, onCategorySelect }) => {
  // Featured promotions/offers
  const promotions = [
    {
      id: 1,
      title: 'Fresh Groceries',
      subtitle: 'Farm-fresh produce delivered to your door',
      badge: 'Same Day Delivery',
      gradient: 'from-green-500 to-emerald-600',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 2,
      title: 'Electronics',
      subtitle: 'Latest gadgets at the best prices',
      badge: 'Up to 40% Off',
      gradient: 'from-blue-500 to-indigo-600',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 3,
      title: 'Beauty & Care',
      subtitle: 'Premium beauty essentials',
      badge: 'New Arrivals',
      gradient: 'from-pink-500 to-rose-600',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="mb-8" aria-label="Featured promotions">
      {/* Main Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-600 text-white mb-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="50,0 100,0 100,100 0,100" />
          </svg>
        </div>
        
        <div className="relative px-6 py-8 md:px-10 md:py-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Free Delivery in Nairobi
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              Shop Quality Products in Kenya
            </h2>
            <p className="text-white/90 text-base md:text-lg mb-6 max-w-lg">
              Discover thousands of products from trusted brands. Fast delivery, secure payments, and easy returns.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products?category=Electronics"
                className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Shop Electronics
              </Link>
              <Link
                to="/products?category=Groceries"
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              >
                Shop Groceries
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {promotions.map((promo) => (
          <button
            key={promo.id}
            onClick={() => onCategorySelect && onCategorySelect(promo.title)}
            className={`group relative overflow-hidden rounded-xl bg-gradient-to-r ${promo.gradient} p-4 md:p-5 text-white text-left transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
            aria-label={`Shop ${promo.title}`}
          >
            <div className="absolute top-0 right-0 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform">
              {promo.icon}
              <div className="w-16 h-16">{promo.icon}</div>
            </div>
            
            <div className="relative z-10">
              <span className="inline-block bg-white/20 text-xs font-bold px-2 py-1 rounded-full mb-2">
                {promo.badge}
              </span>
              <h3 className="font-bold text-lg mb-1">{promo.title}</h3>
              <p className="text-white/80 text-sm">{promo.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default ProductsPageHero;
