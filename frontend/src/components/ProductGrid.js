import { Helmet } from 'react-helmet-async';
import React, { useState } from 'react';
import ProductCard from './ui/ProductCard';
import QuickViewModal from './ui/QuickViewModal';

const ProductGrid = ({ products, onAddToCart, loading }) => {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse h-64" />
        ))}
      </div>
    );
  }
  // Show all products - placeholder images are acceptable
  if (!products.length) {
    return (
      <div className="text-center py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products Yet</h3>
          <p className="text-gray-600 mb-6">
            More amazing products coming soon! Check back later for great deals.
          </p>
          <a 
            href="/products" 
            className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Explore All Products
          </a>
        </div>
      </div>
    );
  }
  return (
    <>
      <Helmet>
        <title>Shop Products | EasyCart</title>
        <meta name="description" content="Browse our wide selection of products at EasyCart. Find the best deals on groceries, electronics, fashion, and more." />
      </Helmet>
      <section aria-label="Product Grid" className="w-full">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-6">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onQuickView={() => setQuickViewProduct(product)}
            />
          ))}
        </div>
        {quickViewProduct && (
          <QuickViewModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onAddToCart={onAddToCart}
          />
        )}
      </section>
    </>
  );
};



export default ProductGrid;
