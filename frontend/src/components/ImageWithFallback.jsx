import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ImageWithFallback Component
 * Displays images with lazy loading, skeleton loading state, and fallback on error
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for the image
 * @param {string} fallbackCategory - Category for fallback image (product, hero, category, icon)
 * @param {boolean} lazy - Enable lazy loading (default: false)
 * @param {boolean} showSkeleton - Show skeleton during loading (default: false)
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 */
const ImageWithFallback = ({
  src,
  alt = '',
  fallbackCategory = 'product',
  lazy = false,
  showSkeleton = false,
  className = '',
  style = {},
  ...props
}) => {
  const [imageState, setImageState] = useState('loading'); // loading, loaded, error
  const [imageSrc, setImageSrc] = useState(src);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef(null);

  // Fallback images by category
  const fallbackImages = {
    product: '/images/placeholder-product.jpg',
    hero: '/images/placeholder-hero.jpg',
    icon: '/images/placeholder-icon.jpg',
    category: '/images/placeholder-category.jpg'
  };

  // Lazy loading observer
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  // Update image source when src prop changes
  useEffect(() => {
    setImageSrc(src);
    setImageState('loading');
  }, [src]);

  const handleImageLoad = () => {
    setImageState('loaded');
  };

  const handleImageError = () => {
    const fallback = fallbackImages[fallbackCategory] || fallbackImages.product;
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
      setImageState('loading');
    } else {
      setImageState('error');
    }
  };

  const shouldShowImage = isInView && imageSrc;
  const isLoading = imageState === 'loading';

  return (
    <div 
      ref={imgRef}
      className={`image-with-fallback ${className}`}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {shouldShowImage && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            display: isLoading && showSkeleton ? 'none' : 'block'
          }}
          {...props}
        />
      )}
      
      {/* Skeleton Loader */}
      {showSkeleton && isLoading && (
        <div 
          className="skeleton-loader absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center"
          style={{ width: '100%', height: '100%' }}
        >
          <svg 
            className="w-10 h-10 text-gray-400 dark:text-gray-500" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      )}

      {/* Placeholder when not in view (lazy loading) */}
      {!isInView && (
        <div 
          className="placeholder absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
          style={{ width: '100%', height: '100%' }}
        >
          <div className="text-gray-400 text-2xl">📦</div>
        </div>
      )}
    </div>
  );
};

ImageWithFallback.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  fallbackCategory: PropTypes.oneOf(['product', 'hero', 'category', 'icon']),
  lazy: PropTypes.bool,
  showSkeleton: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

export default ImageWithFallback;
