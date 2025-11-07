import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Progressive image loading component with blur-up effect
 * Loads a low-quality placeholder first, then transitions to full quality
 */
const ProgressiveImage = ({ 
  src, 
  placeholder,
  alt, 
  className = '',
  width,
  height,
  sizes,
  srcSet,
  onLoad,
  onError,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(placeholder || src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Only load full image if we have a placeholder
    if (!placeholder) {
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImgSrc(src);
      setIsLoading(false);
      if (onLoad) onLoad();
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      if (onError) onError();
    };

    // Cleanup function to prevent memory leaks
    return () => {
      img.onload = null;
      img.onerror = null;
      img.src = ''; // Release image reference
    };
  }, [src, placeholder, onLoad, onError]);

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg 
          className="w-12 h-12 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'blur-sm scale-105' : 'blur-0 scale-100'} transition-all duration-500 ease-in-out`}
        loading="lazy"
        decoding="async"
        width={width}
        height={height}
        sizes={sizes}
        srcSet={srcSet}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
    </div>
  );
};

ProgressiveImage.propTypes = {
  src: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sizes: PropTypes.string,
  srcSet: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default ProgressiveImage;
