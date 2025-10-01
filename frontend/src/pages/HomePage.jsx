import React from 'react';
import ProductList from '../components/ProductList';
import { Helmet } from 'react-helmet-async';

/**
 * HomePage Component
 * Displays the main product listing page using ProductList component
 * 
 * This is an example of how to integrate the ProductList component
 * into your application. The ProductList component handles:
 * - Fetching products from the API
 * - Displaying them in a responsive grid
 * - Loading, error, and empty states
 * - Product cards with all required information
 */
const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Shop Products | EasyCart - Kenya's Online Supermarket</title>
        <meta 
          name="description" 
          content="Browse thousands of products at EasyCart. Get the best deals on groceries, electronics, fashion, and more. Free delivery on orders over KSh 2,000 in Nairobi." 
        />
      </Helmet>
      
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-12 px-4">
          <div className="container mx-auto max-w-7xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to EasyCart
            </h1>
            <p className="text-xl md:text-2xl mb-6">
              Kenya's Leading Online Shopping Platform
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span>Quality Products</span>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="container mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Our Products
            </h2>
            <p className="text-gray-600">
              Browse our wide selection of quality products at great prices
            </p>
          </div>
          
          {/* ProductList Component - Handles everything automatically */}
          <ProductList />
        </section>

        {/* Features Section */}
        <section className="bg-white py-12 px-4 mt-12">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-center mb-8">
              Why Shop With Us?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">🚚</div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-gray-600">
                  Free delivery on orders over KSh 2,000 in Nairobi
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">💳</div>
                <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
                <p className="text-gray-600">
                  M-Pesa, Visa, Mastercard, and more payment options
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">⭐</div>
                <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
                <p className="text-gray-600">
                  100% genuine products from trusted brands
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage;
