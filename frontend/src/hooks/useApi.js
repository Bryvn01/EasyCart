import { useState, useEffect, useCallback } from 'react';
import { ErrorHandler } from '../utils/errorHandler';
import { PerformanceMonitor } from '../utils/performance';

export const useApi = (apiCall, options = {}) => {
  const {
    immediate = false,
    deps = [],
    onSuccess,
    onError,
    retries = 0,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    const measurementName = `api-call-${Date.now()}`;
    PerformanceMonitor.startMeasurement(measurementName);
    
    setLoading(true);
    setError(null);
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await apiCall(...args);
        setData(result);
        setLoading(false);
        
        PerformanceMonitor.endMeasurement(measurementName, { 
          status: 'success',
          attempt: attempt + 1
        });
        
        if (onSuccess) onSuccess(result);
        return result;
        
      } catch (err) {        
        if (attempt === retries) {
          setError(err);
          setLoading(false);
          
          PerformanceMonitor.endMeasurement(measurementName, { 
            status: 'error',
            attempt: attempt + 1,
            error: err.message
          });
          
          if (onError) {
            onError(err);
          } else {
            ErrorHandler.handleApiError(err, { apiCall: apiCall.name });
          }
          
          throw err;
        }
        
        // Wait before retry
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }
  }, [apiCall, retries, retryDelay, onSuccess, onError, ...deps]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

// Hook for paginated API calls
export const usePaginatedApi = (apiCall, options = {}) => {
  const {
    pageSize = 20,
    initialPage = 1,
    ...apiOptions
  } = options;

  const [page, setPage] = useState(initialPage);
  const [allData, setAllData] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const {
    loading,
    error,
    execute: executeApi
  } = useApi(apiCall, {
    ...apiOptions,
    onSuccess: (result) => {
      const newData = result.data || result.results || [];
      const totalCount = result.count || result.total || 0;
      
      if (page === 1) {
        setAllData(newData);
      } else {
        setAllData(prev => [...prev, ...newData]);
      }
      
      setHasMore(allData.length + newData.length < totalCount);
      
      if (apiOptions.onSuccess) {
        apiOptions.onSuccess(result);
      }
    }
  });

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  const refresh = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
  }, []);

  useEffect(() => {
    executeApi({ page, page_size: pageSize });
  }, [page, pageSize, executeApi]);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    currentPage: page
  };
};

// Hook for caching API responses
export const useCachedApi = (apiCall, cacheKey, options = {}) => {
  const { cacheTime = 5 * 60 * 1000, ...apiOptions } = options; // 5 minutes default
  
  const [cache, setCache] = useState(() => {
    try {
      const cached = localStorage.getItem(`api-cache-${cacheKey}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < cacheTime) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    return null;
  });

  const {
    data,
    loading,
    error,
    execute
  } = useApi(apiCall, {
    ...apiOptions,
    immediate: !cache && apiOptions.immediate,
    onSuccess: (result) => {
      // Cache the result
      try {
        localStorage.setItem(`api-cache-${cacheKey}`, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn('Cache write error:', error);
      }
      
      setCache(result);
      if (apiOptions.onSuccess) {
        apiOptions.onSuccess(result);
      }
    }
  });

  const invalidateCache = useCallback(() => {
    try {
      localStorage.removeItem(`api-cache-${cacheKey}`);
      setCache(null);
    } catch (error) {
      console.warn('Cache invalidation error:', error);
    }
  }, [cacheKey]);

  return {
    data: cache || data,
    loading: !cache && loading,
    error,
    execute,
    invalidateCache
  };
};