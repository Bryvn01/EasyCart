import React from 'react';
import PropTypes from 'prop-types';

/**
 * ResponsiveImage - Professional image component
 * Features:
 * - Responsive srcset for multiple sizes
 * - Lazy loading by default
 * - WebP format support with fallback
 * - Proper aspect ratio handling
 * - Accessibility with alt text
 */
const ResponsiveImage = ({
  src,
  alt,
  sizes = '100vw',
  loading = 'lazy',
  className = '',
  aspectRatio = '1/1',
  width,
  height,
  objectFit = 'cover',
  priority = false,
}) => {
  // Generate srcset for different widths
  const generateSrcSet = (baseSrc) => {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    return widths
      .map((w) => {
        // If using a CDN that supports query params for resizing
        if (baseSrc.includes('cloudinary') || baseSrc.includes('imgix')) {
          return `${baseSrc}?w=${w} ${w}w`;
        }
        // Otherwise just return the src with width descriptor
        return `${baseSrc} ${w}w`;
      })
      .join(', ');
  };

  // Try to generate WebP version
  const getWebPSrc = (baseSrc) => {
    if (baseSrc.includes('.jpg') || baseSrc.includes('.jpeg') || baseSrc.includes('.png')) {
      return baseSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return null;
  };

  const webpSrc = getWebPSrc(src);
  const imgLoading = priority ? 'eager' : loading;

  return (
    <picture className={className}>
      {/* WebP format for modern browsers */}
      {webpSrc && (
        <source
          type="image/webp"
          srcSet={generateSrcSet(webpSrc)}
          sizes={sizes}
        />
      )}

      {/* Fallback to original format */}
      <img
        src={src}
        srcSet={generateSrcSet(src)}
        sizes={sizes}
        alt={alt}
        loading={imgLoading}
        decoding="async"
        width={width}
        height={height}
        style={{
          aspectRatio,
          objectFit,
          width: '100%',
          height: 'auto',
        }}
      />
    </picture>
  );
};

ResponsiveImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  sizes: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  className: PropTypes.string,
  aspectRatio: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  objectFit: PropTypes.oneOf(['cover', 'contain', 'fill', 'none', 'scale-down']),
  priority: PropTypes.bool,
};

export default ResponsiveImage;
