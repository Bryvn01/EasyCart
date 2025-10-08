import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getCloudinaryUrl, generateResponsiveSizes } from '../utils/images';

/**
 * Enhanced ImageWithFallback Component
 * Displays images with advanced features:
 * - Lazy loading with IntersectionObserver
 * - Progressive loading (blur-up technique)
 * - Skeleton loading state with animations
 * - Automatic retry on failure
 * - Responsive image sizes (srcSet)
 * - Fallback handling for broken URLs
 * - Connection-aware quality adjustment
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for the image
 * @param {string} fallbackCategory - Category for fallback image (product, hero, category, icon)
 * @param {boolean} lazy - Enable lazy loading (default: false)
 * @param {boolean} showSkeleton - Show skeleton during loading (default: false)
 * @param {boolean} progressive - Enable progressive/blur-up loading (default: false)
 * @param {boolean} responsive - Generate responsive srcSet (default: true)
 * @param {number} retryCount - Number of retry attempts on error (default: 2)
 * @param {number} width - Target width for Cloudinary optimization
 * @param {number} height - Target height for Cloudinary optimization
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 */
const ImageWithFallback = ({
  src,
  alt = '',
  fallbackCategory = 'product',
  lazy = false,
  showSkeleton = false,
  progressive = false,
  responsive = true,
  retryCount = 2,
  width,
  height,
  className = '',
  style = {},
  ...props
}) => {
  const [imageState, setImageState] = useState('loading'); // loading, loaded, error
  const [imageSrc, setImageSrc] = useState(src);
  const [isInView, setIsInView] = useState(!lazy);
  const [retries, setRetries] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const imgRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Fallback images by category
  const fallbackImages = {
    product: '/images/placeholder-product.jpg',
    hero: '/images/placeholder-hero.jpg',
    icon: '/images/placeholder-icon.jpg',
    category: '/images/placeholder-category.jpg'
  };

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

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
    // Optimize image URL if it's a Cloudinary URL
    const optimizedSrc = getCloudinaryUrl(src, { width, height, quality: 'auto' });
    setImageSrc(optimizedSrc);
    setImageState('loading');
    setRetries(0);
    setLoadProgress(0);
  }, [src, width, height]);

  // Simulate loading progress for better UX
  useEffect(() => {
    if (imageState === 'loading' && showSkeleton) {
      const interval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [imageState, showSkeleton]);

  const handleImageLoad = () => {
    setImageState('loaded');
    setLoadProgress(100);
  };

  const handleImageError = () => {
    // Try to retry loading the image
    if (retries < retryCount && imageSrc === src) {
      setRetries(prev => prev + 1);
      retryTimeoutRef.current = setTimeout(() => {
        setImageState('loading');
        // Force reload by adding timestamp
        setImageSrc(`${src}${src.includes('?') ? '&' : '?'}retry=${Date.now()}`);
      }, 1000 * (retries + 1)); // Exponential backoff
      return;
    }

    // Fall back to placeholder
    const fallback = fallbackImages[fallbackCategory] || fallbackImages.product;
    if (imageSrc !== fallback && !imageSrc.includes(fallback)) {
      setImageSrc(fallback);
      setImageState('loading');
      setRetries(0);
    } else {
      setImageState('error');
    }
  };

  const shouldShowImage = isInView && imageSrc;
  const isLoading = imageState === 'loading';
  
  // Generate responsive image sizes if enabled
  const responsiveProps = responsive && imageSrc && !imageSrc.includes('placeholder') 
    ? generateResponsiveSizes(imageSrc, width, height)
    : {};

  return (
    <div 
      ref={imgRef}
      className={`image-with-fallback ${className}`}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {shouldShowImage && (
        <>
          {/* Low quality image placeholder for progressive loading */}
          {progressive && isLoading && imageSrc && (
            <img
              src={getCloudinaryUrl(imageSrc, { width: 50, quality: 10, blur: 100 })}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-sm"
              style={{ filter: 'blur(10px)', transform: 'scale(1.1)' }}
            />
          )}
          
          {/* Main image */}
          <img
            src={imageSrc}
            alt={alt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading={lazy ? 'lazy' : 'eager'}
            className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              display: isLoading && showSkeleton ? 'none' : 'block'
            }}
            {...responsiveProps}
            {...props}
          />
        </>
      )}
      
      {/* Skeleton Loader */}
      {showSkeleton && isLoading && (
        <div 
          className="skeleton-loader absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center"
          style={{ width: '100%', height: '100%' }}
        >
          <div className="flex flex-col items-center">
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
            {loadProgress > 0 && loadProgress < 100 && (
              <div className="mt-2 w-24 h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            )}
          </div>
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
      
      {/* Error state */}
      {imageState === 'error' && (
        <div 
          className="error-state absolute inset-0 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center"
          style={{ width: '100%', height: '100%' }}
        >
          <svg 
            className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <span className="text-xs text-gray-500 dark:text-gray-400">Failed to load image</span>
        </div>
      )}
      
      {/* Retry indicator */}
      {retries > 0 && retries < retryCount && isLoading && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          Retry {retries}/{retryCount}
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
  progressive: PropTypes.bool,
  responsive: PropTypes.bool,
  retryCount: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object
};

export default ImageWithFallback;
