import { useEffect } from 'react';
import { analytics } from '../services/analytics';

export const usePerformance = () => {
  useEffect(() => {
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      analytics.track('Page Load Time', { duration: loadTime });
    });
  }, []);
};

export const measureApiCall = async (apiCall, eventName) => {
  const start = performance.now();
  try {
    const result = await apiCall();
    const duration = performance.now() - start;
    analytics.track('API Call', { name: eventName, duration, status: 'success' });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    analytics.track('API Call', { name: eventName, duration, status: 'error' });
    throw error;
  }
};