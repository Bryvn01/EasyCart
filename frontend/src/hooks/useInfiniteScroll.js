import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for infinite scroll functionality
 * Implements intersection observer pattern for performance
 *
 * @param {Function} fetchMore - Function to fetch more data
 * @param {boolean} hasMore - Whether there's more data to load
 * @param {boolean} loading - Current loading state
 * @param {Object} options - Configuration options
 * @returns {Object} - Ref for sentinel element and loading states
 */
const useInfiniteScroll = (fetchMore, hasMore, loading, options = {}) => {
  const {
    threshold = 0.5,
    rootMargin = '100px',
    enabled = true
  } = options;

  const [isFetching, setIsFetching] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const handleIntersection = useCallback((entries) => {
    const target = entries[0];

    if (target.isIntersecting && hasMore && !loading && !isFetching && enabled) {
      setIsFetching(true);
      fetchMore().finally(() => {
        setIsFetching(false);
      });
    }
  }, [fetchMore, hasMore, loading, isFetching, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const sentinel = sentinelRef.current;

    if (!sentinel) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null, // viewport
      rootMargin,
      threshold
    });

    observerRef.current.observe(sentinel);

    // Cleanup
    return () => {
      if (observerRef.current && sentinel) {
        observerRef.current.unobserve(sentinel);
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold, rootMargin, enabled]);

  return {
    sentinelRef,
    isFetching
  };
};

export default useInfiniteScroll;
