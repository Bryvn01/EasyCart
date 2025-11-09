import React from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';

/**
 * OptimizedImage - Wrapper for Next.js Image with fallback for SSR/CSR
 * Usage: Use this for all product/category images for best performance.
 */
const OptimizedImage = ({ src, alt, width = 400, height = 400, ...props }) => {
  // fallback to regular img if not running in Next.js (e.g., during tests)
  if (typeof window === 'undefined') {
    // Extract only valid HTML img attributes, exclude Next.js specific props
    const { blurDataURL, placeholder, priority, quality, ...htmlProps } = props;
    return <img src={src} alt={alt} width={width} height={height} {...htmlProps} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      placeholder="blur"
      blurDataURL="/images/placeholder-product.jpg"
      style={{ objectFit: 'cover', ...props.style }}
      {...props}
    />
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
};

export default OptimizedImage;
