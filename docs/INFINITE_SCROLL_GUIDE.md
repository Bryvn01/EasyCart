# Infinite Scroll Implementation Guide

## Overview

This guide explains how to use the new infinite scroll feature implemented with React Query v5 in the EasyCart frontend.

## Quick Start

### Using Infinite Scroll in Products Page

The Products page (`frontend/src/pages/Products.js`) now uses infinite scroll instead of pagination:

```jsx
import { useInfiniteProducts } from '../hooks/useInfiniteProducts';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const MyComponent = () => {
  // 1. Use the infinite products hook
  const {
    products,           // Flattened array of all loaded products
    totalCount,         // Total number of products available
    isLoading,          // Initial loading state
    isFetchingNextPage, // Loading next page state
    hasNextPage,        // Whether more pages are available
    fetchNextPage,      // Function to manually fetch next page
  } = useInfiniteProducts({
    search: searchTerm,
    category: selectedCategory,
    ordering: sortBy,
    priceRange: { min: '', max: '' },
    pageSize: 12
  });

  // 2. Set up intersection observer for auto-loading
  const { sentinelRef } = useInfiniteScroll(
    () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    {
      enabled: hasNextPage && !isFetchingNextPage,
      threshold: 200 // Trigger 200px before bottom
    }
  );

  return (
    <div>
      {/* Render products */}
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}

      {/* Sentinel element for triggering load */}
      <div ref={sentinelRef} style={{ height: '20px' }} />

      {/* Loading indicator */}
      {isFetchingNextPage && <LoadingSpinner />}

      {/* End message */}
      {!hasNextPage && <div>No more products</div>}
    </div>
  );
};
```

## Hook API Reference

### useInfiniteProducts

**Import:**
```jsx
import { useInfiniteProducts } from '../hooks/useInfiniteProducts';
```

**Parameters:**
- `search` (string): Search query
- `category` (string): Category filter
- `ordering` (string): Sort order (e.g., '-created_at', 'price')
- `priceRange` (object): `{ min: string, max: string }`
- `pageSize` (number): Items per page (default: 12)

**Returns:**
- `products` (array): Flattened array of all loaded products
- `totalCount` (number): Total number of products
- `isLoading` (boolean): Initial load state
- `isFetchingNextPage` (boolean): Loading next page
- `hasNextPage` (boolean): More pages available
- `fetchNextPage` (function): Manually fetch next page
- `isError` (boolean): Error occurred
- `error` (object): Error details

### useInfiniteScroll

**Import:**
```jsx
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
```

**Parameters:**
- `callback` (function): Function to call when bottom is reached
- `options` (object):
  - `enabled` (boolean): Whether observer is active (default: true)
  - `threshold` (number): Distance from bottom in pixels (default: 200)

**Returns:**
- `sentinelRef` (ref): Ref to attach to sentinel element

## Progressive Image Component

### ProgressiveImage

**Import:**
```jsx
import ProgressiveImage from '../components/ui/ProgressiveImage';
```

**Usage:**
```jsx
<ProgressiveImage
  src={product.image}           // Full resolution image URL
  thumbnail={product.thumbnail_url} // Low quality placeholder (optional)
  alt={product.name}
  aspectRatio="1/1"              // CSS aspect ratio
  objectFit="cover"              // CSS object-fit property
  className="custom-class"       // Additional CSS classes
/>
```

**Props:**
- `src` (string, required): Full resolution image URL
- `thumbnail` (string): Low quality placeholder URL
- `alt` (string): Alt text for accessibility
- `aspectRatio` (string): CSS aspect-ratio (default: '1/1')
- `objectFit` (string): CSS object-fit (default: 'cover')
- `className` (string): Additional CSS classes

**Features:**
- Automatic blur-up effect (10px blur → sharp)
- Lazy loading support
- Error handling with fallback UI
- Zero layout shift
- Smooth transitions

## Sticky Cart Bar

### StickyCartBar

**Import:**
```jsx
import StickyCartBar from '../components/mobile/StickyCartBar';
```

**Usage:**
```jsx
<StickyCartBar
  product={currentProduct}
  onAddToCart={handleAddToCart}
  isAdding={isAddingToCart}
/>
```

**Props:**
- `product` (object, required): Product object with:
  - `id` (string|number)
  - `name` (string)
  - `price` (string|number)
  - `image` (string)
  - `thumbnail_url` (string)
  - `stock` (number)
- `onAddToCart` (function, required): Callback when add-to-cart clicked
- `isAdding` (boolean): Loading state

**Features:**
- Mobile-only (< 768px)
- Appears when product header scrolls out of view
- iOS safe area support
- Smooth slide-up animation
- Loading and out-of-stock states

**Required Setup:**
Add `data-sticky-trigger` attribute to the element that should trigger visibility:

```jsx
<div data-sticky-trigger>
  {/* Product header content */}
</div>
```

## Backend API

### Product Model Fields

New fields added to Product model:

```python
class Product(models.Model):
    # ... existing fields ...
    thumbnail_url = models.URLField(blank=True, max_length=500)
    blurhash = models.CharField(max_length=100, blank=True)
```

### API Response Format

Products API now returns:

```json
{
  "count": 150,
  "next": true,
  "previous": false,
  "results": [
    {
      "id": 1,
      "name": "Product Name",
      "price": "1999.99",
      "image": "https://res.cloudinary.com/.../product.jpg",
      "thumbnail_url": "https://res.cloudinary.com/.../w_100.../product.jpg",
      "blurhash": "",
      "stock": 10,
      // ... other fields
    }
  ]
}
```

## Performance Tips

1. **Adjust Page Size:** Default is 12 items. Increase for desktop, decrease for mobile:
   ```jsx
   const isMobile = useMediaQuery('(max-width: 768px)');
   const pageSize = isMobile ? 8 : 16;
   ```

2. **Adjust Threshold:** Control when next page loads:
   ```jsx
   // Load earlier (smoother but more requests)
   threshold: 400
   
   // Load later (fewer requests but slight pause)
   threshold: 100
   ```

3. **Conditional Loading:** Disable auto-load when user is filtering:
   ```jsx
   const { sentinelRef } = useInfiniteScroll(
     () => fetchNextPage(),
     {
       enabled: hasNextPage && !isFetchingNextPage && !isFiltering,
       threshold: 200
     }
   );
   ```

## Troubleshooting

### Infinite loop of requests

**Problem:** Pages keep loading continuously  
**Solution:** Ensure `enabled` condition in useInfiniteScroll includes `!isFetchingNextPage`:

```jsx
enabled: hasNextPage && !isFetchingNextPage
```

### Scroll position not preserved

**Problem:** Page scrolls to top on navigation back  
**Solution:** React Query v5 automatically preserves scroll. Ensure `gcTime` is set:

```jsx
gcTime: 10 * 60 * 1000  // 10 minutes
```

### Duplicate products appearing

**Problem:** Same products appear multiple times  
**Solution:** Ensure product IDs are unique and `getNextPageParam` is correct:

```jsx
getNextPageParam: (lastPage) => {
  return lastPage.next ? lastPage.page + 1 : undefined;
}
```

### Images not loading progressively

**Problem:** All images load at full resolution immediately  
**Solution:** Ensure thumbnail_url is being passed:

```jsx
<ProgressiveImage
  src={product.image}
  thumbnail={product.thumbnail_url}  // Don't forget this!
  alt={product.name}
/>
```

## Migration from Pagination

If you have existing code using pagination:

**Before:**
```jsx
const { products, loading, pagination } = useProducts({
  page: currentPage,
  pageSize: 12
});
```

**After:**
```jsx
const {
  products,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage
} = useInfiniteProducts({
  pageSize: 12
});

const { sentinelRef } = useInfiniteScroll(
  () => hasNextPage && fetchNextPage(),
  { enabled: hasNextPage && !isFetchingNextPage }
);
```

## Best Practices

1. **Always include a sentinel element** for Intersection Observer
2. **Show loading indicators** for better UX during fetch
3. **Handle error states** gracefully
4. **Set appropriate staleTime** based on data update frequency
5. **Use thumbnail URLs** for progressive loading
6. **Test on various network speeds** (throttle in DevTools)
7. **Respect user's reduced motion preference** for animations

## Examples

See complete examples in:
- `frontend/src/pages/Products.js` - Infinite scroll implementation
- `frontend/src/pages/ProductDetail.js` - Sticky cart bar usage
- `frontend/src/components/ui/ProgressiveImage.jsx` - Progressive image component

## Support

For issues or questions, refer to:
- React Query v5 docs: https://tanstack.com/query/latest
- Intersection Observer API: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- Main implementation doc: `ENTERPRISE_MOBILE_UX_IMPLEMENTATION.md`
