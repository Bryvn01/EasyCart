/**
 * Example Integration: ImageWithFallback in Product and Category Cards
 * 
 * This file demonstrates how to integrate ImageWithFallback component
 * into ProductCard and CategoryCard components.
 */

import React from 'react';
import ImageWithFallback from './ImageWithFallback';
import './ImageWithFallback.css';

/**
 * Example 1: Product Card Integration
 * 
 * Replace existing image handling with ImageWithFallback
 */
export const ProductCardExample = ({ product }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Image Container with aspect ratio */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={product.image || product.image_url}
          alt={product.name}
          fallbackCategory="product"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          lazy={true}
          showSkeleton={true}
          width="400"
          height="400"
          performanceMonitoring={false}
        />
        
        {/* Stock badge overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      
      {/* Product Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-primary-600">
            ${product.price}
          </span>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Example 2: Category Card Integration
 * 
 * Simple category card with image and name
 */
export const CategoryCardExample = ({ category }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
      {/* Category Image */}
      <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
        <ImageWithFallback
          src={category.image}
          alt={category.name}
          fallbackCategory="category"
          className="w-full h-full object-cover transition-all duration-500 hover:scale-110"
          lazy={true}
          showSkeleton={true}
        />
      </div>
      
      {/* Category Name */}
      <h3 className="text-sm font-semibold text-gray-900 text-center hover:text-primary-600 transition-colors">
        {category.name}
      </h3>
    </div>
  );
};

/**
 * Example 3: Product Grid with ImageWithFallback
 * 
 * Complete product grid implementation
 */
export const ProductGridExample = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCardExample key={product.id} product={product} />
      ))}
    </div>
  );
};

/**
 * Example 4: Hero Banner with ImageWithFallback
 * 
 * Full-width hero image with overlay text
 */
export const HeroBannerExample = ({ banner }) => {
  return (
    <div className="relative w-full h-96 overflow-hidden">
      <ImageWithFallback
        src={banner.image}
        alt={banner.title}
        fallbackCategory="hero"
        className="w-full h-full object-cover"
        lazy={false} // Load immediately for hero images
        showSkeleton={true}
      />
      
      {/* Overlay content */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {banner.title}
          </h1>
          <p className="text-xl text-white mb-6">
            {banner.description}
          </p>
          <button className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Example 5: Thumbnail Gallery with ImageWithFallback
 * 
 * Product image gallery with thumbnails
 */
export const ThumbnailGalleryExample = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = React.useState(0);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="image-container image-container--square">
        <ImageWithFallback
          src={images[selectedImage]}
          alt={`${productName} - View ${selectedImage + 1}`}
          fallbackCategory="product"
          className="img-cover rounded-lg"
          lazy={false}
          showSkeleton={true}
        />
      </div>
      
      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
              selectedImage === index ? 'border-primary-600' : 'border-gray-200'
            }`}
          >
            <ImageWithFallback
              src={image}
              alt={`${productName} - Thumbnail ${index + 1}`}
              fallbackCategory="product"
              className="w-full h-full object-cover"
              lazy={true}
              showSkeleton={true}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Example 6: User Avatar with ImageWithFallback
 * 
 * Circular user avatar image
 */
export const UserAvatarExample = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden`}>
      <ImageWithFallback
        src={user.avatar}
        alt={user.name}
        fallbackCategory="icon"
        className="w-full h-full object-cover"
        lazy={false}
        showSkeleton={true}
      />
    </div>
  );
};

/**
 * Example 7: Lazy Loading Product List
 * 
 * Infinite scroll product list with lazy loaded images
 */
export const LazyProductListExample = ({ products }) => {
  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={product.id} className="flex bg-white rounded-lg shadow-sm p-4 gap-4">
          {/* Product Image - lazy loaded */}
          <div className="w-24 h-24 flex-shrink-0">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              fallbackCategory="product"
              className="w-full h-full object-cover rounded-lg"
              lazy={true}
              showSkeleton={true}
              // Only start monitoring performance for first 5 items
              performanceMonitoring={index < 5}
            />
          </div>
          
          {/* Product Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-gray-600 text-sm">{product.description}</p>
            <p className="text-primary-600 font-bold mt-2">${product.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Example 8: Image with Custom Error Handler
 * 
 * Product card with custom error handling
 */
export const ProductCardWithErrorHandlingExample = ({ product }) => {
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = (event) => {
    console.error('Failed to load product image:', product.id);
    setImageError(true);
    // Could send analytics event here
  };

  const handleImageLoad = (event) => {
    console.log('Product image loaded successfully:', product.id);
    setImageError(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <ImageWithFallback
        src={product.image}
        alt={product.name}
        fallbackCategory="product"
        className="w-full aspect-square object-cover rounded-lg"
        lazy={true}
        showSkeleton={true}
        onError={handleImageError}
        onLoad={handleImageLoad}
        retryCount={2}
        retryDelay={1000}
      />
      
      {imageError && (
        <div className="mt-2 text-sm text-yellow-600">
          ⚠️ Image not available
        </div>
      )}
      
      <h3 className="mt-2 font-semibold">{product.name}</h3>
      <p className="text-primary-600">${product.price}</p>
    </div>
  );
};

/**
 * Example 9: Progressive Image Loading
 * 
 * Load thumbnail first, then full image
 */
export const ProgressiveImageExample = ({ product }) => {
  return (
    <div className="relative">
      <ImageWithFallback
        src={product.imageUrl}
        alt={product.name}
        fallbackCategory="product"
        className="w-full aspect-square object-cover rounded-lg"
        lazy={true}
        showSkeleton={true}
        performanceMonitoring={true}
      />
    </div>
  );
};

/**
 * Example 10: Responsive Image Grid
 * 
 * Grid that adapts to screen size
 */
export const ResponsiveImageGridExample = ({ items }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {items.map((item) => (
        <div key={item.id} className="image-container image-container--square">
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            fallbackCategory={item.type || 'product'}
            className="img-cover rounded-lg hover:opacity-80 transition-opacity"
            lazy={true}
            showSkeleton={true}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Migration Example: Before and After
 */

// BEFORE: Old implementation
export const OldProductCard = ({ product }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  
  const handleImageError = (e) => {
    e.target.src = '/images/placeholder-product.jpg';
    e.target.onerror = null; // Prevent infinite loop
  };

  return (
    <div className="product-card">
      {!imageLoaded && (
        <div className="skeleton animate-pulse bg-gray-200" />
      )}
      <img
        src={product.image}
        alt={product.name}
        onLoad={() => setImageLoaded(true)}
        onError={handleImageError}
        loading="lazy"
        className={imageLoaded ? '' : 'hidden'}
      />
    </div>
  );
};

// AFTER: New implementation with ImageWithFallback
export const NewProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <ImageWithFallback
        src={product.image}
        alt={product.name}
        fallbackCategory="product"
        className="w-full"
        lazy={true}
        showSkeleton={true}
      />
    </div>
  );
};

/**
 * Usage in existing components:
 * 
 * 1. Import ImageWithFallback:
 *    import ImageWithFallback from './ImageWithFallback';
 * 
 * 2. Replace existing <img> tags:
 *    <img src={...} alt={...} />
 *    ↓
 *    <ImageWithFallback src={...} alt={...} fallbackCategory="product" />
 * 
 * 3. Remove manual error handling:
 *    - Remove useState for imageLoaded
 *    - Remove onError handlers
 *    - Remove manual skeleton loaders
 * 
 * 4. Add lazy loading:
 *    lazy={true} for below-the-fold images
 *    lazy={false} for above-the-fold (hero, first products)
 */

const examples = {
  ProductCardExample,
  CategoryCardExample,
  ProductGridExample,
  HeroBannerExample,
  ThumbnailGalleryExample,
  UserAvatarExample,
  LazyProductListExample,
  ProductCardWithErrorHandlingExample,
  ProgressiveImageExample,
  ResponsiveImageGridExample,
};

export default examples;
