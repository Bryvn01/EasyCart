// Image optimization and fallback utility
export const optimizeImage = (url, width = 400, height = 400) => {
  if (!url) return '/images/placeholder-product.jpg';
  
  // If it's already an optimized URL or external URL, return as is
  if (url.includes('http') || url.includes('cloudinary')) return url;
  
  // For local images, ensure proper path
  if (url.startsWith('/')) return url;
  
  return `/images/products/${url}`;
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

// Generate multiple image sizes for responsive loading
export const getImageSizes = (baseUrl, sizes = [400, 600, 800]) => {
  if (!baseUrl || baseUrl.startsWith('/images/')) return { src: baseUrl };
  
  // For external images, you can implement resizing service here
  return {
    src: baseUrl,
    srcSet: sizes.map(size => `${baseUrl}?width=${size} ${size}w`).join(', '),
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  };
};