# EasyCart Performance Optimization Guide

## Image Optimization

### WebP Implementation with JPEG Fallback

#### HTML Picture Element:
```html
<picture>
  <source srcset="product-image.webp" type="image/webp">
  <source srcset="product-image.jpg" type="image/jpeg">
  <img src="product-image.jpg" alt="Product name" loading="lazy">
</picture>
```

#### React Component:
```jsx
const OptimizedImage = ({ src, alt, className }) => {
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img 
        src={src} 
        alt={alt} 
        className={className}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
};
```

### Cloudinary Automatic Format:
```javascript
// Update imageUtils.js
export const getOptimizedImageUrl = (url, options = {}) => {
  const { width = 400, quality = 'auto', format = 'auto' } = options;
  
  if (url.includes('cloudinary.com')) {
    // Insert transformations
    return url.replace('/upload/', `/upload/f_${format},q_${quality},w_${width}/`);
  }
  
  return url;
};
```

---

## Lazy Loading Strategy

### Images Below the Fold:
```jsx
// Already implemented with loading="lazy"
<img src={imageUrl} alt={alt} loading="lazy" />
```

### Intersection Observer for Components:
```javascript
import { useEffect, useRef, useState } from 'react';

export const useLazyLoad = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

// Usage:
const ProductCard = ({ product }) => {
  const [ref, isVisible] = useLazyLoad();
  
  return (
    <div ref={ref}>
      {isVisible && <ProductContent product={product} />}
    </div>
  );
};
```

---

## Code Splitting

### Route-Based Splitting:
```javascript
// App.js
import { lazy, Suspense } from 'react';

const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </Suspense>
  );
}
```

### Component-Based Splitting:
```javascript
const HeavyComponent = lazy(() => import('./components/HeavyComponent'));

// Use only when needed
{showHeavy && (
  <Suspense fallback={<div>Loading...</div>}>
    <HeavyComponent />
  </Suspense>
)}
```

---

## Caching Strategy

### Service Worker (Create: public/service-worker.js):
```javascript
const CACHE_NAME = 'easycart-v1';
const urlsToCache = [
  '/',
  '/products',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch with Network First strategy for API
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // Network first for API
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache first for static assets
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request))
    );
  }
});
```

### Register Service Worker:
```javascript
// index.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
```

---

## API Response Caching

### React Query Configuration:
```javascript
// Already implemented, but optimize:
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2
    }
  }
});
```

---

## Bundle Size Optimization

### Analyze Bundle:
```bash
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

### Tree Shaking:
```javascript
// Import only what you need
import { useState, useEffect } from 'react'; // ✓ Good
import React from 'react'; // ✗ Imports everything

// Lodash
import debounce from 'lodash/debounce'; // ✓ Good
import _ from 'lodash'; // ✗ Imports entire library
```

### Dynamic Imports:
```javascript
// Load heavy libraries only when needed
const loadChartLibrary = async () => {
  const Chart = await import('chart.js');
  return Chart;
};
```

---

## Network Optimization

### Compression (Render.com):
```yaml
# render.yaml
services:
  - type: web
    name: easycart-frontend
    env: static
    buildCommand: npm run build
    staticPublishPath: ./build
    headers:
      - path: /*
        name: Cache-Control
        value: public, max-age=31536000, immutable
      - path: /
        name: Cache-Control
        value: no-cache
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### Preconnect to External Domains:
```html
<!-- public/index.html -->
<link rel="preconnect" href="https://res.cloudinary.com">
<link rel="dns-prefetch" href="https://res.cloudinary.com">
<link rel="preconnect" href="https://easycart-backend-2k8l.onrender.com">
```

---

## Critical CSS

### Inline Critical CSS:
```html
<!-- public/index.html -->
<style>
  /* Critical above-the-fold styles */
  body { margin: 0; font-family: 'Inter', sans-serif; }
  .navbar { position: sticky; top: 0; z-index: 50; }
  .hero { min-height: 400px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
</style>
```

---

## Performance Metrics

### Lighthouse Targets:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 95

### Core Web Vitals:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Monitoring:
```javascript
// Add to index.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric);
  // Send to your analytics service
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## Mobile-Specific Optimizations

### Reduce JavaScript Execution:
```javascript
// Debounce scroll events
const handleScroll = debounce(() => {
  // Scroll logic
}, 100);

// Use passive event listeners
window.addEventListener('scroll', handleScroll, { passive: true });
```

### Optimize Touch Events:
```css
/* Prevent 300ms tap delay */
* {
  touch-action: manipulation;
}

/* Optimize scrolling */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  overflow-scrolling: touch;
}
```

---

## Database Query Optimization (Backend)

### Django ORM:
```python
# products/views.py
from django.db.models import Prefetch

# Optimize queries with select_related and prefetch_related
products = Product.objects.select_related('category').prefetch_related('reviews')

# Add database indexes
class Product(models.Model):
    name = models.CharField(max_length=200, db_index=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['name', 'price']),
            models.Index(fields=['-created_at']),
        ]
```

---

## Implementation Checklist

### Phase 1: Quick Wins (1-2 hours)
- [ ] Add loading="lazy" to all images
- [ ] Implement React.lazy for routes
- [ ] Add preconnect links
- [ ] Enable compression on Render

### Phase 2: Medium Impact (2-4 hours)
- [ ] Implement service worker
- [ ] Add Intersection Observer for products
- [ ] Optimize Cloudinary images
- [ ] Add web-vitals monitoring

### Phase 3: Advanced (4-8 hours)
- [ ] Implement WebP with fallbacks
- [ ] Add critical CSS
- [ ] Optimize bundle size
- [ ] Database query optimization

---

## Testing

### Lighthouse Audit:
```bash
# Chrome DevTools > Lighthouse
# Or CLI:
npm install -g lighthouse
lighthouse https://easycart-frontend-wj9x.onrender.com --view
```

### Network Throttling:
```
Chrome DevTools > Network > Throttling
- Fast 3G
- Slow 3G
- Offline
```

### Performance Budget:
```javascript
// package.json
{
  "performance": {
    "maxBundleSize": "500kb",
    "maxImageSize": "200kb",
    "maxInitialLoad": "3s"
  }
}
```

---

## Expected Results

### Before Optimization:
- Lighthouse Score: 70-80
- Load Time: 4-6s
- Bundle Size: 800kb+
- Images: 500kb+

### After Optimization:
- Lighthouse Score: 90-95
- Load Time: 1.5-2.5s
- Bundle Size: 400kb
- Images: 100kb (WebP)

---

**Priority**: Implement Phase 1 immediately for presentation
**Impact**: 40-50% improvement in load times
**Effort**: 2-4 hours total
