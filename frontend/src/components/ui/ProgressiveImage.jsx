import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ProgressiveImage component with blur-up placeholder effect
 * Displays a blurred low-quality placeholder while the full image loads
 * 
 * @param {string} src - Full resolution image URL
 * @param {string} thumbnail - Low quality image placeholder URL (optional)
 * @param {string} alt - Alternative text for accessibility
 * @param {string} className - Additional CSS classes
 * @param {string} aspectRatio - CSS aspect ratio (e.g., '1/1', '16/9')
 * @param {string} objectFit - CSS object-fit property ('cover', 'contain', etc.)
 */
const ProgressiveImage = ({ 
  src, 
  thumbnail, 
  alt = '', 
  className = '',
  aspectRatio = '1/1',
  objectFit = 'cover'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(thumbnail || src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setHasError(false);
    setCurrentSrc(thumbnail || src);

    // Pre-load the full resolution image
    if (thumbnail && src !== thumbnail) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setHasError(true);
        setIsLoaded(true);
      };
    } else {
      // No thumbnail, just load the source directly
      setIsLoaded(true);
    }
  }, [src, thumbnail]);

  return (
    <div 
      className={`progressive-image-wrapper ${className}`}
      style={{ 
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: aspectRatio,
        backgroundColor: 'var(--gray-100)'
      }}
    >
      {!hasError ? (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="progressive-image"
          style={{
            width: '100%',
            height: '100%',
            objectFit: objectFit,
            transition: 'filter 500ms ease-out, transform 500ms ease-out',
            filter: isLoaded ? 'blur(0)' : 'blur(10px)',
            transform: isLoaded ? 'scale(1)' : 'scale(1.05)',
            willChange: 'filter, transform'
          }}
          onError={() => setHasError(true)}
        />
      ) : (
        // Fallback placeholder when image fails to load
        <div 
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            color: 'var(--gray-400)',
            backgroundColor: 'var(--gray-100)'
          }}
        >
          <svg 
            className="w-16 h-16" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <span className="text-xs">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

ProgressiveImage.propTypes = {
  src: PropTypes.string.isRequired,
  thumbnail: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  aspectRatio: PropTypes.string,
  objectFit: PropTypes.string
};

export default ProgressiveImage;
