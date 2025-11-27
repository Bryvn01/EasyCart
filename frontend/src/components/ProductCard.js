import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card } from './ui';
import PropTypes from 'prop-types';
import OptimizedImage from './OptimizedImage';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart, onQuickView, loading = false, priority = false }) => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) {
    return (
      <Card className="p-4">
        <div className="text-center text-gray-500">{t('productNotAvailable', 'Product not available')}</div>
      </Card>
    );
  }

  // Get product images - support multiple images
  const productImages = product.images && product.images.length > 0
    ? product.images.map(img => typeof img === 'object' ? img.url : img)
    : [product.image || '/images/placeholder-product.jpg'];

  const currentImage = productImages[currentImageIndex];
  const hasMultipleImages = productImages.length > 1;

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView();
  };

  return (
    <Card
      hover
      className="product-card group overflow-hidden transition-all duration-300 hover:shadow-card-hover animate-fade-in relative"
    >
      {/* Product Image Section */}
      <div className="product-card-image-container">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          <OptimizedImage
            src={currentImage}
            alt={product.name}
            width={400}
            height={400}
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-card-image"
          />
          {/* Image Navigation Dots for Multiple Images */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentImageIndex === index
                      ? 'bg-white scale-125'
                      : 'bg-white bg-opacity-50'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </Link>

        {/* Stock Status Overlays */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-2 rounded-lg font-semibold text-sm">
              {t('outOfStock', 'Out of Stock')}
            </span>
          </div>
        )}

        {product.stock > 0 && product.stock < 10 && (
          <div className="absolute top-2 right-2">
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
              {t('onlyXLeft', { count: product.stock, defaultValue: 'Only {{count}} left' })}
            </span>
          </div>
        )}

        {/* Quick View Button */}
        {product.stock > 0 && (
          <button
            onClick={handleQuickView}
            className="absolute top-2 left-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
            title={t('quickView', 'Quick View')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}

        {/* Discount Badge */}
        {product.discount_percentage > 0 && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            {t('discountPercent', { percent: product.discount_percentage, defaultValue: '-{{percent}}%' })}
          </div>
        )}
      </div>

      {/* Product Info Section */}
      <div className="product-card-content p-4 space-y-3">
        <Link to={`/products/${product.id}`}>
          <h3
            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2 min-h-[3.5rem]"
            title={product.name && product.name.length > 30 ? product.name : undefined}
          >
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
          {product.description || t('defaultProductDescription', 'Quality product with guaranteed satisfaction')}
        </p>

        {/* Price Section */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                KSh {product.price?.toLocaleString()}
              </span>
              {product.original_price > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  KSh {product.original_price?.toLocaleString()}
                </span>
              )}
            </div>
            {product.stock > 0 ? (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('inStock', 'In stock')}
              </span>
            ) : (
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                {t('outOfStock', 'Out of stock')}
              </span>
            )}
          </div>

          <Button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0 || loading}
            loading={loading}
            size="sm"
            className="shrink-0 transition-all hover:scale-105 bg-primary-600 hover:bg-primary-700 border-primary-600"
          >
            {product.stock === 0 ? t('outOfStock', 'Out of Stock') : t('addToCart', 'Add to Cart')}
          </Button>
        </div>

        {/* Rating Section */}
        {product.rating > 0 && (
          <div className="flex items-center space-x-1 pt-1">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${star <= Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({product.review_count || 0})
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    original_price: PropTypes.number,
    stock: PropTypes.number,
    discount_percentage: PropTypes.number,
    rating: PropTypes.number,
    review_count: PropTypes.number
  }),
  onAddToCart: PropTypes.func.isRequired,
  onQuickView: PropTypes.func,
  loading: PropTypes.bool,
  priority: PropTypes.bool,
};

export default ProductCard;
