import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to detect when user scrolls near the bottom of the page
 * Uses Intersection Observer API for optimal performance
 * 
 * @param {Function} callback - Function to call when bottom is reached
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether the observer is active
 * @param {number} options.threshold - Distance from bottom to trigger (in pixels)
 * @returns {Object} - { observerRef } - Ref to attach to sentinel element
 */
export const useInfiniteScroll = (callback, options = {}) => {
  const {
    enabled = true,
    threshold = 200
  } = options;

  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    
    // Only trigger callback if observer is enabled and element is intersecting
    if (enabled && entry.isIntersecting) {
      callback();
    }
  }, [enabled, callback]);

  useEffect(() => {
    // Create Intersection Observer
    const options = {
      root: null, // viewport
      rootMargin: `${threshold}px`, // Trigger when element is within threshold pixels
      threshold: 0.01 // Trigger as soon as any part of element is visible
    };

    observerRef.current = new IntersectionObserver(handleIntersection, options);

    // Observe the sentinel element if it exists
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold]);

  return { sentinelRef };
};

export default useInfiniteScroll;
