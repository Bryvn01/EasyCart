// Image optimization and fallback utility

/**
 * Optimize image URL with Cloudinary transformations
 * @param {string} url - Image URL
 * @param {object} options - Optimization options
 * @returns {string} Optimized image URL
 */
export const getCloudinaryUrl = (url, options = {}) => {
  if (!url) return '/images/placeholder-product.jpg';
  
  // If it's a placeholder or local image, return as is
  if (url.includes('placeholder') || url.startsWith('/images/')) {
    return url;
  }
  
  // If it's not a Cloudinary URL, return as is
  if (!url.includes('cloudinary.com') && !url.includes('res.cloudinary')) {
    return url;
  }
  
  try {
    // Parse Cloudinary URL and add transformations
    const { width, height, quality = 'auto', format = 'auto', blur } = options;
    
    // Build transformation string
    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);
    if (blur) transformations.push(`e_blur:${blur}`);
    
    // If URL already has transformations, enhance them
    if (url.includes('/upload/') && transformations.length > 0) {
      const transformStr = transformations.join(',');
      return url.replace('/upload/', `/upload/${transformStr}/`);
    }
    
    return url;
  } catch (error) {
    console.error('Error optimizing Cloudinary URL:', error);
    return url;
  }
};

/**
 * Generate responsive image sizes for srcSet
 * @param {string} url - Base image URL
 * @param {number} targetWidth - Target width
 * @param {number} targetHeight - Target height
 * @returns {object} Object with srcSet and sizes attributes
 */
export const generateResponsiveSizes = (url, targetWidth, targetHeight) => {
  if (!url || url.includes('placeholder') || !url.includes('cloudinary')) {
    return {};
  }
  
  try {
    // Generate multiple size variants for different screen densities and sizes
    const sizes = [
      { width: Math.floor(targetWidth || 400), density: 1 },
      { width: Math.floor((targetWidth || 400) * 1.5), density: 1.5 },
      { width: Math.floor((targetWidth || 400) * 2), density: 2 }
    ];
    
    const srcSet = sizes
      .map(({ width, density }) => {
        const options = { width, quality: 'auto', format: 'auto' };
        if (targetHeight) {
          options.height = Math.floor(targetHeight * density);
        }
        return `${getCloudinaryUrl(url, options)} ${density}x`;
      })
      .join(', ');
    
    return {
      srcSet,
      sizes: targetWidth 
        ? `(max-width: ${targetWidth}px) 100vw, ${targetWidth}px`
        : '100vw'
    };
  } catch (error) {
    console.error('Error generating responsive sizes:', error);
    return {};
  }
};

/**
 * Validate image URL
 * @param {string} url - Image URL to validate
 * @returns {boolean} True if valid
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Check for common image URL patterns
  const imageUrlPattern = /^(https?:\/\/).*\.(jpg|jpeg|png|gif|webp|svg|bmp)/i;
  const dataUriPattern = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/i;
  const cloudinaryPattern = /cloudinary\.com\/.*\/image\/upload/i;
  const localPattern = /^\/images\//i;
  
  return (
    imageUrlPattern.test(url) ||
    dataUriPattern.test(url) ||
    cloudinaryPattern.test(url) ||
    localPattern.test(url)
  );
};

/**
 * Detect connection speed and return appropriate quality setting
 * @returns {string} Quality setting (auto, low, medium, high)
 */
export const getConnectionQuality = () => {
  // Check if Network Information API is available
  if ('connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection.saveData) {
      return 'low'; // User has data saver enabled
    }
    
    const effectiveType = connection.effectiveType;
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'low';
      case '3g':
        return 'medium';
      case '4g':
        return 'high';
      default:
        return 'auto';
    }
  }
  
  return 'auto'; // Default to auto if API not available
};

/**
 * Get optimized image quality based on connection
 * @param {string} url - Image URL
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @returns {string} Optimized image URL
 */
export const getConnectionAwareImage = (url, width, height) => {
  const quality = getConnectionQuality();
  
  const qualityMap = {
    low: 50,
    medium: 70,
    high: 85,
    auto: 'auto'
  };
  
  return getCloudinaryUrl(url, {
    width,
    height,
    quality: qualityMap[quality],
    format: 'auto'
  });
};

// Legacy function - kept for backward compatibility
export const optimizeImage = (url, width = 400, height = 400) => {
  return getCloudinaryUrl(url, { width, height, quality: 'auto' });
};

export const imageFallback = (e, category = 'product') => {
  const fallbacks = {
    product: '/images/placeholder-product.jpg',
    hero: '/images/placeholder-hero.jpg',
    icon: '/images/placeholder-icon.jpg',
    category: '/images/placeholder-category.jpg'
  };
  
  e.target.src = fallbacks[category] || '/images/placeholder-product.jpg';
  e.target.onerror = null; // Prevent infinite loop
};

// Legacy function - kept for backward compatibility
export const getImageSizes = (baseUrl, sizes = [400, 600, 800]) => {
  if (!baseUrl || baseUrl.startsWith('/images/')) return { src: baseUrl };
  
  // For external images, use new responsive function
  if (baseUrl.includes('cloudinary')) {
    return generateResponsiveSizes(baseUrl, sizes[1]);
  }
  
  return {
    src: baseUrl,
    srcSet: sizes.map(size => `${baseUrl}?width=${size} ${size}w`).join(', '),
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  };
};