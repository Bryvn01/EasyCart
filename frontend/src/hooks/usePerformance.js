import { useEffect } from 'react';
import { analytics } from '../services/analytics';
import { PerformanceMonitor } from '../utils/performance';

export const usePerformance = () => {
  useEffect(() => {
    const measurementName = 'app-load-time';
    PerformanceMonitor.startMeasurement(measurementName);
    
    const handleLoad = () => {
      try {
        // Measure app load time
        PerformanceMonitor.endMeasurement(measurementName);
        
        // Get navigation timing
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          analytics.track('Page Load Complete', { 
            duration: loadTime,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            firstPaint: navigation.responseEnd - navigation.fetchStart
          });
        }
        
        // Track initial memory usage
        PerformanceMonitor.trackMemoryUsage();
        
      } catch (error) {
        console.warn('Performance measurement not available:', error);
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);
};

export const measureApiCall = PerformanceMonitor.measureAsync;