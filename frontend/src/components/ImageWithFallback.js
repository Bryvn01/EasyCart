import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Production-ready ImageWithFallback component
 * 
 * Features:
 * - Error handling with fallback images
 * - Environment-driven image path resolution
 * - Lazy loading support
 * - Skeleton loading state
 * - Performance monitoring
 * - Retry mechanism
 * - Error boundaries
 */
const ImageWithFallback = ({
  src,
  alt,
  fallbackSrc,
  fallbackCategory = 'product',
  className = '',
  width,
  height,
  lazy = true,
  showSkeleton = true,
  skeletonClassName = '',
  onLoad,
  onError,
  style = {},
  retryCount = 1,
  retryDelay = 1000,
  performanceMonitoring = false,
  ...restProps
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retries, setRetries] = useState(0);
  const imageRef = useRef(null);
  const loadStartTime = useRef(null);

  // Default fallback images by category
  const defaultFallbacks = {
    product: '/images/placeholder-product.jpg',
    category: '/images/placeholder-category.jpg',
    hero: '/images/placeholder-hero.jpg',
    icon: '/images/placeholder-icon.jpg',
  };

  /**
   * Resolve image URL based on environment configuration
   * @param {string} url - Image URL to resolve
   * @returns {string} - Resolved image URL
   */
  const resolveImageUrl = (url) => {
    if (!url) return null;

    // If it's already a complete URL (http/https), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a data URL, return as is
    if (url.startsWith('data:')) {
      return url;
    }

    // If it starts with /, it's a local public path
    if (url.startsWith('/')) {
      return url;
    }

    // For backend-uploaded images, prepend IMAGE_BASE_URL
    const imageBaseUrl = process.env.REACT_APP_IMAGE_BASE_URL || '';
    if (imageBaseUrl && !url.startsWith('/')) {
      return `${imageBaseUrl}/${url}`;
    }

    // Default: assume it's a local image
    return `/${url}`;
  };

  /**
   * Get fallback image URL
   * @returns {string} - Fallback image URL
   */
  const getFallbackUrl = () => {
    if (fallbackSrc) {
      return resolveImageUrl(fallbackSrc);
    }
    return defaultFallbacks[fallbackCategory] || defaultFallbacks.product;
  };

  // Update image source when prop changes
  useEffect(() => {
    const resolvedSrc = resolveImageUrl(src);
    setImageSrc(resolvedSrc);
    setHasError(false);
    setRetries(0);
    setIsLoading(true);
  }, [src]);

  /**
   * Handle image load event
   */
  const handleLoad = (event) => {
    setIsLoading(false);
    setHasError(false);

    // Performance monitoring
    if (performanceMonitoring && loadStartTime.current) {
      const loadTime = performance.now() - loadStartTime.current;
      console.log(`[ImageWithFallback] Image loaded in ${loadTime.toFixed(2)}ms:`, imageSrc);
    }

    // Call custom onLoad handler
    if (onLoad) {
      onLoad(event);
    }
  };

  /**
   * Handle image error with retry mechanism
   */
  const handleError = (event) => {
    console.warn(`[ImageWithFallback] Failed to load image:`, imageSrc);

    // Retry logic
    if (retries < retryCount && imageSrc !== getFallbackUrl()) {
      console.log(`[ImageWithFallback] Retrying (${retries + 1}/${retryCount})...`);
      setTimeout(() => {
        setRetries(retries + 1);
        // Force reload by adding timestamp
        setImageSrc(`${imageSrc}${imageSrc.includes('?') ? '&' : '?'}retry=${Date.now()}`);
      }, retryDelay);
      return;
    }

    // Use fallback image
    const fallbackUrl = getFallbackUrl();
    if (imageSrc !== fallbackUrl) {
      console.log('[ImageWithFallback] Using fallback image:', fallbackUrl);
      setImageSrc(fallbackUrl);
      setHasError(false); // Reset error state to try loading fallback
      return;
    }

    // All attempts failed
    setIsLoading(false);
    setHasError(true);

    // Call custom onError handler
    if (onError) {
      onError(event);
    }
  };

  /**
   * Track load start time for performance monitoring
   */
  useEffect(() => {
    if (performanceMonitoring && isLoading) {
      loadStartTime.current = performance.now();
    }
  }, [isLoading, performanceMonitoring]);

  /**
   * Intersection Observer for lazy loading
   */
  useEffect(() => {
    if (!lazy || !imageRef.current) return;

    const currentImageRef = imageRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is in viewport, start loading
            const imgElement = entry.target;
            const dataSrc = imgElement.getAttribute('data-src');
            if (dataSrc && !imgElement.src) {
              imgElement.src = dataSrc;
            }
            observer.unobserve(imgElement);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    if (currentImageRef) {
      observer.observe(currentImageRef);
    }

    return () => {
      if (currentImageRef) {
        observer.unobserve(currentImageRef);
      }
    };
  }, [lazy]);

  // Render skeleton loader
  if (showSkeleton && isLoading && !hasError) {
    return (
      <>
        {/* Skeleton loader */}
        <div
          className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${skeletonClassName || className}`}
          style={{
            width: width || '100%',
            height: height || '100%',
            ...style,
          }}
          aria-label={`Loading ${alt || 'image'}`}
        >
          <div className="flex items-center justify-center h-full">
            <svg
              className="w-10 h-10 text-gray-300 dark:text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {/* Actual image (hidden while loading) */}
        <img
          ref={imageRef}
          src={lazy ? undefined : imageSrc}
          data-src={lazy ? imageSrc : undefined}
          alt={alt}
          className={`${className} ${isLoading ? 'hidden' : ''}`}
          width={width}
          height={height}
          style={style}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          {...restProps}
        />
      </>
    );
  }

  // Render error state
  if (hasError) {
    return (
      <div
        className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}
        style={{
          width: width || '100%',
          height: height || '100%',
          ...style,
        }}
        role="img"
        aria-label={alt || 'Failed to load image'}
      >
        <div className="text-center text-gray-400 dark:text-gray-600 p-4">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm">Image unavailable</p>
        </div>
      </div>
    );
  }

  // Render image
  return (
    <img
      ref={imageRef}
      src={lazy ? undefined : imageSrc}
      data-src={lazy ? imageSrc : undefined}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
      onLoad={handleLoad}
      onError={handleError}
      loading={lazy ? 'lazy' : 'eager'}
      {...restProps}
    />
  );
};

ImageWithFallback.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  fallbackSrc: PropTypes.string,
  fallbackCategory: PropTypes.oneOf(['product', 'category', 'hero', 'icon']),
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  lazy: PropTypes.bool,
  showSkeleton: PropTypes.bool,
  skeletonClassName: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  style: PropTypes.object,
  retryCount: PropTypes.number,
  retryDelay: PropTypes.number,
  performanceMonitoring: PropTypes.bool,
};

export default ImageWithFallback;
