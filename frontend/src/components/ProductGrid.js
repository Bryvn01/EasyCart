import { Helmet } from 'react-helmet-async';
import React, { useState } from 'react';
import CompactProductCard from './CompactProductCard';
import { getProductImageUrl } from '../utils/imageUtils';
import EmptyState from './EmptyState';

import { ProductGridSkeleton } from './ui/LoadingSkeleton';
import dynamic from 'next/dynamic';
const QuickViewModal = dynamic(() => import('./ui/QuickViewModal'), { ssr: false, loading: () => <div className="fixed inset-0 flex items-center justify-center z-50"><div className="bg-white rounded-lg shadow-lg p-8 animate-pulse w-96 h-64" /></div> });


// Add optional error prop for future extensibility
const ProductGrid = ({ products = [], onAddToCart, loading, error }) => {
  const productList = Array.isArray(products) ? products : [];
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  if (error) {
    return (
      <EmptyState
        type="error"
        title="Failed to Load Products"
        message={error?.message || 'We\'re having trouble loading products. Please try again later.'}
        actionText="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  if (loading) {
    return <ProductGridSkeleton count={8} />;
  }

  // Show all products - placeholder images are acceptable
  if (!productList.length) {
    return (
      <EmptyState
        type="products"
        title="No Products Yet"
        message="More amazing products coming soon! Check back later for great deals."
        actionText="Explore All Products"
        actionLink="/products"
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>Shop Products | EasyCart</title>
        <meta name="description" content="Browse our wide selection of products at EasyCart. Find the best deals on groceries, electronics, fashion, and more." />
      </Helmet>

      <section aria-label="Product Grid" className="w-full">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-5 lg:gap-6">
          {productList
            .filter(product => product && product.id && product.name)
            .map((product, index) => (
              <CompactProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                priority={index < 8}
                getProductImageUrl={getProductImageUrl}
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
