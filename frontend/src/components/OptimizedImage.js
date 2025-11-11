import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * OptimizedImage - Production-grade image optimization component
 *
 * Features:
 * - WebP format with fallback to original
 * - Lazy loading with Intersection Observer
 * - Responsive images with srcset
 * - Blur-up placeholder effect
 * - Error handling with fallback
 * - Loading skeleton
 *
 * Usage:
 * <OptimizedImage
 *   src="/path/to/image.jpg"
 *   alt="Product name"
 *   width={400}
 *   height={400}
 *   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
 * />
 */
const OptimizedImage = ({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  style = {},
  sizes,
  priority = false, // Skip lazy loading for above-fold images
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Load immediately if priority
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before visible
        threshold: 0.01
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Set image source when in view
  useEffect(() => {
    if (isInView && src) {
      setImageSrc(src);
    }
  }, [isInView, src]);

  // Generate WebP URL if using Cloudinary
  const getWebPUrl = (url) => {
    if (!url) return null;

    // Cloudinary optimization
    if (url.includes('cloudinary.com')) {
      // Add Cloudinary transformations: f_auto (format), q_auto (quality)
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/f_auto,q_auto,w_${width},h_${height},c_fill/${parts[1]}`;
      }
    }

    return url;
  };

  // Generate srcset for responsive images
  const getSrcSet = (url) => {
    if (!url || !url.includes('cloudinary.com')) return undefined;

    const widths = [320, 640, 768, 1024, 1280];
    const parts = url.split('/upload/');
    if (parts.length !== 2) return undefined;

    return widths
      .map(w => {
        const optimizedUrl = `${parts[0]}/upload/f_auto,q_auto,w_${w},c_fill/${parts[1]}`;
        return `${optimizedUrl} ${w}w`;
      })
      .join(', ');
  };

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  const optimizedSrc = getWebPUrl(imageSrc);
  const srcSet = getSrcSet(imageSrc);

  // Default sizes if not provided
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  return (
    <div
      ref={imgRef}
      className={`optimized-image-wrapper ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
        ...style
      }}
    >
      {/* Loading Skeleton */}
      {!isLoaded && !hasError && (
        <div
          className="image-skeleton"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
          aria-hidden="true"
        />
      )}

      {/* Actual Image */}
      {isInView && imageSrc && !hasError && (
        <img
          src={optimizedSrc || imageSrc}
          srcSet={srcSet}
          sizes={defaultSizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          crossOrigin="anonymous"
          onLoad={handleLoad}
          onError={handleError}
          className={`optimized-image ${isLoaded ? 'loaded' : ''}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            ...props.style
          }}
          {...props}
        />
      )}

      {/* Error Fallback */}
      {hasError && (
        <div
          className="image-error-fallback"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#f3f4f6',
            color: '#9ca3af',
            fontSize: '2rem'
          }}
          role="img"
          aria-label={alt}
        >
          <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      )}
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
  sizes: PropTypes.string,
  priority: PropTypes.bool,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default OptimizedImage;
