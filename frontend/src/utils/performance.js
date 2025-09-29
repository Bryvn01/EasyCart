import React from 'react';
import { analytics } from '../services/analytics';

export class PerformanceMonitor {
  static measurements = new Map();
  
  static startMeasurement(name) {
    const start = performance.now();
    this.measurements.set(name, { start, name });
    return name;
  }
  
  static endMeasurement(name, context = {}) {
    const measurement = this.measurements.get(name);
    if (!measurement) {
      console.warn(`No measurement found for: ${name}`);
      return;
    }
    
    const duration = performance.now() - measurement.start;
    this.measurements.delete(name);
    
    // Track performance metric
    analytics.track('Performance Metric', {
      name,
      duration,
      ...context
    });
    
    return duration;
  }
  
  static measureAsync(name, asyncFn, context = {}) {
    return async (...args) => {
      this.startMeasurement(name);
      try {
        const result = await asyncFn(...args);
        this.endMeasurement(name, { ...context, status: 'success' });
        return result;
      } catch (error) {
        this.endMeasurement(name, { ...context, status: 'error' });
        throw error;
      }
    };
  }
  
  static measureComponent(ComponentName) {
    return (WrappedComponent) => {
      return function MeasuredComponent(props) {
        React.useEffect(() => {
          const start = performance.now();
          return () => {
            const duration = performance.now() - start;
            analytics.track('Component Render Time', {
              component: ComponentName,
              duration
            });
          };
        });
        
        return React.createElement(WrappedComponent, props);
      };
    };
  }
  
  static observeWebVitals() {
    // Observe Core Web Vitals
    if ('web-vitals' in window) {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = window.webVitals;
      
      getCLS((metric) => {
        analytics.track('Web Vital - CLS', {
          value: metric.value,
          rating: metric.rating
        });
      });
      
      getFID((metric) => {
        analytics.track('Web Vital - FID', {
          value: metric.value,
          rating: metric.rating
        });
      });
      
      getFCP((metric) => {
        analytics.track('Web Vital - FCP', {
          value: metric.value,
          rating: metric.rating
        });
      });
      
      getLCP((metric) => {
        analytics.track('Web Vital - LCP', {
          value: metric.value,
          rating: metric.rating
        });
      });
      
      getTTFB((metric) => {
        analytics.track('Web Vital - TTFB', {
          value: metric.value,
          rating: metric.rating
        });
      });
    }
  }
  
  static trackResourceTiming() {
    if (typeof PerformanceObserver !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            analytics.track('Resource Load Time', {
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize,
              type: entry.initiatorType
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  }
  
  static getMemoryUsage() {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
  
  static trackMemoryUsage() {
    const memory = this.getMemoryUsage();
    if (memory) {
      analytics.track('Memory Usage', memory);
    }
  }
  
  static startMemoryMonitoring(interval = 30000) {
    setInterval(() => {
      this.trackMemoryUsage();
    }, interval);
  }
}

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const startMeasurement = PerformanceMonitor.startMeasurement.bind(PerformanceMonitor);
  const endMeasurement = PerformanceMonitor.endMeasurement.bind(PerformanceMonitor);
  const measureAsync = PerformanceMonitor.measureAsync.bind(PerformanceMonitor);
  
  return {
    startMeasurement,
    endMeasurement,
    measureAsync
  };
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Start memory monitoring in production
  if (process.env.NODE_ENV === 'production') {
    PerformanceMonitor.startMemoryMonitoring();
  }
  
  // Track resource timing
  PerformanceMonitor.trackResourceTiming();
  
  // Observe web vitals when available
  PerformanceMonitor.observeWebVitals();
}