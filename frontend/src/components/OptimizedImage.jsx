import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * OptimizedImage Component
 *
 * Performance-optimized image component with:
 * - Lazy loading (native + intersection observer fallback)
 * - WebP format with fallback
 * - Responsive images (srcset)
 * - Loading placeholder
 * - Error handling
 * - Cloudinary optimization
 *
 * @example
 * <OptimizedImage
 *   src="https://res.cloudinary.com/demo/image.jpg"
 *   alt="Product image"
 *   width={400}
 *   height={300}
 * />
 */
const OptimizedImage = ({
  src,
  alt = '',
  width,
  height,
  className = '',
  sizes = '100vw',
  priority = false,
  objectFit = 'cover',
  quality = 80,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  // Generate Cloudinary optimized URL
  const getOptimizedUrl = (url, opts = {}) => {
    if (!url) return '';

    // If it's already a Cloudinary URL, optimize it
    if (url.includes('res.cloudinary.com')) {
      const baseUrl = url.split('/upload/')[0];
      const imagePath = url.split('/upload/')[1];

      const transformations = [
        `f_auto`, // Auto format (WebP for supported browsers)
        `q_${opts.quality || quality}`, // Quality
        opts.width ? `w_${opts.width}` : '',
        opts.height ? `h_${opts.height}` : '',
        'c_limit', // Don't upscale
      ].filter(Boolean).join(',');

      return `${baseUrl}/upload/${transformations}/${imagePath}`;
    }

    return url;
  };

  // Generate srcset for responsive images
  const getSrcSet = () => {
    if (!width) return null;

    const widths = [320, 640, 768, 1024, 1280, 1536];
    const applicableWidths = widths.filter(w => w <= width * 2);

    return applicableWidths
      .map(w => `${getOptimizedUrl(src, { width: w })} ${w}w`)
      .join(', ');
  };

  useEffect(() => {
    if (priority) {
      // Preload priority images
      setImageSrc(getOptimizedUrl(src, { width, height }));
    } else {
      // Lazy load non-priority images
      const img = new Image();
      img.src = getOptimizedUrl(src, { width, height });
      img.onload = () => setImageSrc(img.src);
    }
  }, [src, width, height, priority]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt || 'Image failed to load'}
      >
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Optimized image */}
      <img
        src={imageSrc || getOptimizedUrl(src, { width, height })}
        srcSet={getSrcSet()}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          objectFit,
          objectPosition: 'center',
        }}
        {...props}
      />
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string,
  sizes: PropTypes.string,
  priority: PropTypes.bool,
  objectFit: PropTypes.oneOf(['contain', 'cover', 'fill', 'none', 'scale-down']),
  quality: PropTypes.number,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default OptimizedImage;
