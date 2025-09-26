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
  // Filter out products without a real image
  const productsWithImages = products.filter(product => {
    const img = product.image_url || product.image;
    return img && !img.includes('placeholder');
  });
  if (!productsWithImages.length) {
    return <div className="text-center text-gray-500 py-8">No products with images found.</div>;
  }
  return (
    <>
      <Helmet>
        <title>Shop Products | EasyCart</title>
        <meta name="description" content="Browse our wide selection of products at EasyCart. Find the best deals on groceries, electronics, fashion, and more." />
      </Helmet>
      <section aria-label="Product Grid" className="w-full">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-6">
          {productsWithImages.map(product => (
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
