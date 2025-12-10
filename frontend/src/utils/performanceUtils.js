/**
 * Performance Optimization Utilities
 *
 * Collection of utilities for improving app performance:
 * - Lazy loading components
 * - Image optimization
 * - Code splitting
 * - Resource hints
 */

import { lazy, Suspense } from 'react';

/**
 * Lazy load component with automatic retry on failure
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} options - Configuration options
 * @returns {React.Component} Lazy loaded component
 */
export const lazyWithRetry = (importFunc, options = {}) => {
  const { maxRetries = 3, retryDelay = 1000 } = options;

  return lazy(() => {
    return new Promise((resolve, reject) => {
      let retryCount = 0;

      const attemptImport = () => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(attemptImport, retryDelay * retryCount);
            } else {
              reject(error);
            }
          });
      };

      attemptImport();
    });
  });
};

/**
 * Preload component for faster navigation
 * @param {Function} importFunc - Dynamic import function
 */
export const preloadComponent = (importFunc) => {
  importFunc();
};

/**
 * Lazy load route component
 * @param {Function} importFunc - Dynamic import function
 * @returns {React.Component} Lazy loaded route
 */
export const lazyRoute = (importFunc) => {
  return lazyWithRetry(importFunc);
};

/**
 * Loading fallback component
 */
export const LoadingFallback = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
      <p className="text-gray-600">{text}</p>
    </div>
  </div>
);

/**
 * Wrap component with Suspense and loading fallback
 * @param {React.Component} Component - Component to wrap
 * @param {Object} fallback - Custom fallback component
 */
export const withSuspense = (Component, fallback = <LoadingFallback />) => {
  return (props) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

/**
 * Debounce function for performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Debounce delay in ms
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for performance
 * @param {Function} func - Function to throttle
 * @param {number} limit - Throttle limit in ms
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Prefetch image for faster loading
 * @param {string} src - Image URL
 */
export const prefetchImage = (src) => {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};

/**
 * Preload critical resource
 * @param {string} href - Resource URL
 * @param {string} as - Resource type (script, style, font, etc.)
 */
export const preloadResource = (href, as = 'script') => {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = href;
  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get device pixel ratio for image optimization
 */
export const getDevicePixelRatio = () => {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
};

/**
 * Check if WebP is supported
 */
export const isWebPSupported = () => {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};

/**
 * Observe element intersection for lazy loading
 * @param {HTMLElement} element - Element to observe
 * @param {Function} callback - Callback when element is visible
 */
export const observeIntersection = (element, callback, options = {}) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    callback();
    return null;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback();
        observer.unobserve(element);
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.01,
    ...options,
  });

  observer.observe(element);
  return observer;
};

/**
 * Get optimal image size based on container
 * @param {number} containerWidth - Container width
 * @param {number} dpr - Device pixel ratio
 */
export const getOptimalImageSize = (containerWidth, dpr = getDevicePixelRatio()) => {
  const sizes = [320, 640, 768, 1024, 1280, 1536, 2048];
  const targetSize = containerWidth * Math.min(dpr, 2); // Cap at 2x for performance

  return sizes.find(size => size >= targetSize) || sizes[sizes.length - 1];
};

/**
 * Measure performance metric
 * @param {string} name - Metric name
 * @param {Function} fn - Function to measure
 */
export const measurePerformance = async (name, fn) => {
  if (typeof window === 'undefined' || !window.performance) {
    return fn();
  }

  const startMark = `${name}-start`;
  const endMark = `${name}-end`;

  performance.mark(startMark);
  const result = await fn();
  performance.mark(endMark);

  try {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0];
    console.log(`⚡ ${name}: ${measure.duration.toFixed(2)}ms`);
  } catch (e) {
    // Ignore errors
  }

  return result;
};

export default {
  lazyWithRetry,
  preloadComponent,
  lazyRoute,
  LoadingFallback,
  withSuspense,
  debounce,
  throttle,
  prefetchImage,
  preloadResource,
  prefersReducedMotion,
  getDevicePixelRatio,
  isWebPSupported,
  observeIntersection,
  getOptimalImageSize,
  measurePerformance,
};
