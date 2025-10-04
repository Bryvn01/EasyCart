# ImageWithFallback Component Documentation

## Overview

The `ImageWithFallback` component is a production-ready React component that provides robust image handling with advanced features including error handling, lazy loading, skeleton screens, and environment-based URL resolution.

## Features

✅ **Error Handling**: Automatic fallback to placeholder images on load failures  
✅ **Environment-Driven URLs**: Resolves image paths based on environment configuration  
✅ **Lazy Loading**: Built-in support for lazy loading with Intersection Observer  
✅ **Skeleton Loading State**: Beautiful loading placeholders during image load  
✅ **Performance Monitoring**: Optional performance tracking for image load times  
✅ **Retry Mechanism**: Configurable retry attempts for failed image loads  
✅ **Accessibility**: Full ARIA support and screen reader compatibility  
✅ **TypeScript Ready**: Comprehensive PropTypes validation  

## Installation

The component is already included in the project. Import it:

```javascript
import ImageWithFallback from '../components/ImageWithFallback';
import '../components/ImageWithFallback.css'; // Optional: for additional styling
```

## Basic Usage

### Simple Image

```javascript
<ImageWithFallback
  src="https://example.com/image.jpg"
  alt="Product image"
/>
```

### With Custom Fallback

```javascript
<ImageWithFallback
  src="https://example.com/image.jpg"
  alt="Product image"
  fallbackSrc="/images/custom-fallback.jpg"
/>
```

### Using Category Fallbacks

```javascript
<ImageWithFallback
  src="https://example.com/image.jpg"
  alt="Category image"
  fallbackCategory="category"
/>
```

Available categories: `product`, `category`, `hero`, `icon`

## Advanced Usage

### Complete Configuration

```javascript
<ImageWithFallback
  src="products/laptop.jpg"
  alt="Gaming Laptop"
  fallbackCategory="product"
  className="w-full h-auto object-cover"
  width={400}
  height={300}
  lazy={true}
  showSkeleton={true}
  skeletonClassName="rounded-lg"
  retryCount={2}
  retryDelay={1000}
  performanceMonitoring={true}
  onLoad={(e) => console.log('Image loaded')}
  onError={(e) => console.log('Image failed')}
  style={{ borderRadius: '8px' }}
/>
```

### Integration in Product Cards

```javascript
import ImageWithFallback from './ImageWithFallback';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="image-container image-container--square">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          fallbackCategory="product"
          className="img-cover image-smooth"
          lazy={true}
          showSkeleton={true}
        />
      </div>
      <h3>{product.name}</h3>
      <p>{product.price}</p>
    </div>
  );
};
```

### Integration in Category Cards

```javascript
const CategoryCard = ({ category }) => {
  return (
    <div className="category-card">
      <div className="image-container image-container--landscape">
        <ImageWithFallback
          src={category.image}
          alt={category.name}
          fallbackCategory="category"
          className="img-cover"
          lazy={true}
        />
      </div>
      <h3>{category.name}</h3>
    </div>
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | **required** | Image source URL |
| `alt` | string | **required** | Alternative text for accessibility |
| `fallbackSrc` | string | `undefined` | Custom fallback image URL |
| `fallbackCategory` | string | `'product'` | Default fallback category (`product`, `category`, `hero`, `icon`) |
| `className` | string | `''` | CSS classes for the image |
| `width` | string\|number | `undefined` | Image width |
| `height` | string\|number | `undefined` | Image height |
| `lazy` | boolean | `true` | Enable lazy loading |
| `showSkeleton` | boolean | `true` | Show skeleton loader |
| `skeletonClassName` | string | `''` | CSS classes for skeleton |
| `onLoad` | function | `undefined` | Callback when image loads |
| `onError` | function | `undefined` | Callback when all load attempts fail |
| `style` | object | `{}` | Inline styles |
| `retryCount` | number | `1` | Number of retry attempts |
| `retryDelay` | number | `1000` | Delay between retries (ms) |
| `performanceMonitoring` | boolean | `false` | Enable performance logging |

## Environment Configuration

The component uses environment variables for URL resolution:

### .env Configuration

```env
# Base URL for backend images
REACT_APP_IMAGE_BASE_URL=http://localhost:8000

# For production
REACT_APP_IMAGE_BASE_URL=https://your-cdn.example.com
```

### URL Resolution Logic

1. **Absolute URLs** (http/https): Used as-is
2. **Data URLs**: Used as-is
3. **Local paths** (starting with /): Used as-is
4. **Relative paths**: Prepended with `REACT_APP_IMAGE_BASE_URL`

Examples:

```javascript
// Absolute URL - no change
"https://cdn.example.com/image.jpg" → "https://cdn.example.com/image.jpg"

// Local path - no change
"/images/product.jpg" → "/images/product.jpg"

// Relative path - prepends base URL
"products/laptop.jpg" → "http://localhost:8000/products/laptop.jpg"

// Data URL - no change
"data:image/png;base64,..." → "data:image/png;base64,..."
```

## Default Fallback Images

The component includes default fallback images for different categories:

- **Product**: `/images/placeholder-product.jpg`
- **Category**: `/images/placeholder-category.jpg`
- **Hero**: `/images/placeholder-hero.jpg`
- **Icon**: `/images/placeholder-icon.jpg`

These placeholder images are automatically created in `public/images/` and are both SVG and JPG formats.

## CSS Utilities

The component comes with optional CSS utilities in `ImageWithFallback.css`:

### Container Classes

```css
.image-container          /* Basic container */
.image-container--square  /* 1:1 aspect ratio */
.image-container--landscape /* 16:9 aspect ratio */
.image-container--portrait  /* 3:4 aspect ratio */
.image-container--hero     /* 21:9 aspect ratio */
```

### Image Classes

```css
.image-smooth    /* Smooth hover effects */
.img-responsive  /* Responsive sizing */
.img-cover       /* Cover object-fit */
.img-contain     /* Contain object-fit */
```

### Skeleton Classes

```css
.skeleton        /* Light mode skeleton */
.skeleton--dark  /* Dark mode skeleton */
.shimmer         /* Shimmer animation */
```

### Example with CSS Utilities

```javascript
<div className="image-container image-container--square">
  <ImageWithFallback
    src={product.image}
    alt={product.name}
    className="img-cover image-smooth"
  />
</div>
```

## Performance Optimization

### Lazy Loading

Lazy loading is enabled by default and uses the Intersection Observer API:

```javascript
<ImageWithFallback
  src={image}
  alt="Product"
  lazy={true} // Images load when entering viewport
/>
```

### Performance Monitoring

Enable performance monitoring to track load times:

```javascript
<ImageWithFallback
  src={image}
  alt="Product"
  performanceMonitoring={true}
/>
```

This will log image load times to the console:
```
[ImageWithFallback] Image loaded in 234.56ms: https://example.com/image.jpg
```

### Retry Mechanism

Configure retry attempts for better reliability:

```javascript
<ImageWithFallback
  src={image}
  alt="Product"
  retryCount={2}        // Retry 2 times
  retryDelay={1000}     // Wait 1 second between retries
/>
```

## Accessibility

The component follows WCAG 2.1 accessibility guidelines:

- ✅ Required `alt` attribute for all images
- ✅ Proper ARIA labels for loading states
- ✅ Role attributes for error states
- ✅ Keyboard navigation support
- ✅ Screen reader compatible

```javascript
// Good - includes alt text
<ImageWithFallback src={image} alt="Red running shoes" />

// Bad - missing alt text (will cause PropTypes warning)
<ImageWithFallback src={image} />
```

## Error Handling Flow

1. **Initial Load Attempt**: Try to load the provided `src`
2. **Retry (if configured)**: Retry loading with timestamp query parameter
3. **Fallback Image**: Use `fallbackSrc` or category fallback
4. **Error State**: Show error message if all attempts fail
5. **Callback**: Call `onError` handler if provided

## Testing

The component includes comprehensive test coverage (24 tests):

```bash
npm test -- ImageWithFallback.test.js
```

Test coverage includes:
- ✅ Basic rendering
- ✅ Skeleton loading states
- ✅ Error handling and fallbacks
- ✅ URL resolution
- ✅ Lazy loading
- ✅ Callbacks
- ✅ PropTypes validation
- ✅ Source updates
- ✅ Accessibility

## Browser Support

- ✅ Chrome 76+
- ✅ Firefox 75+
- ✅ Safari 12.1+
- ✅ Edge 79+

**Note**: Lazy loading uses Intersection Observer API. For older browsers, consider adding a polyfill.

## Common Patterns

### Product Grid

```javascript
const ProductGrid = ({ products }) => (
  <div className="grid grid-cols-3 gap-4">
    {products.map((product) => (
      <div key={product.id} className="image-container image-container--square">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          fallbackCategory="product"
          className="img-cover"
          lazy={true}
        />
      </div>
    ))}
  </div>
);
```

### Hero Banner

```javascript
const HeroBanner = ({ banner }) => (
  <div className="image-container image-container--hero">
    <ImageWithFallback
      src={banner.image}
      alt={banner.title}
      fallbackCategory="hero"
      className="img-cover"
      lazy={false} // Load immediately
      showSkeleton={true}
    />
  </div>
);
```

### Avatar/Icon

```javascript
const UserAvatar = ({ user }) => (
  <div className="w-12 h-12 rounded-full overflow-hidden">
    <ImageWithFallback
      src={user.avatar}
      alt={user.name}
      fallbackCategory="icon"
      className="img-cover"
      width={48}
      height={48}
      lazy={false}
    />
  </div>
);
```

## Troubleshooting

### Images not loading

1. Check `REACT_APP_IMAGE_BASE_URL` in `.env`
2. Verify image URLs in browser DevTools
3. Check CORS configuration if using external CDN
4. Ensure placeholder images exist in `public/images/`

### Skeleton not showing

- Set `showSkeleton={true}` prop
- Import CSS file: `import '../components/ImageWithFallback.css'`

### Lazy loading not working

- Ensure browser supports Intersection Observer
- Check that `lazy={true}` is set
- Verify images are in/near viewport

### Performance issues

- Enable lazy loading for below-the-fold images
- Use appropriate image sizes (width/height props)
- Consider using WebP format for better compression
- Implement image optimization on backend

## Migration Guide

### From existing ProductCard

**Before:**
```javascript
<img
  src={optimizeImage(product.image)}
  alt={product.name}
  onError={(e) => imageFallback(e, 'product')}
  loading="lazy"
/>
```

**After:**
```javascript
<ImageWithFallback
  src={product.image}
  alt={product.name}
  fallbackCategory="product"
  lazy={true}
/>
```

### From existing LazyImage

**Before:**
```javascript
<LazyImage
  src={image}
  alt={alt}
  placeholder="/images/placeholder.jpg"
/>
```

**After:**
```javascript
<ImageWithFallback
  src={image}
  alt={alt}
  fallbackSrc="/images/placeholder.jpg"
  showSkeleton={true}
/>
```

## Contributing

When adding new features or fixing bugs:

1. Update the component in `ImageWithFallback.js`
2. Add tests in `ImageWithFallback.test.js`
3. Update CSS utilities in `ImageWithFallback.css`
4. Document changes in this README
5. Run tests: `npm test -- ImageWithFallback.test.js`

## License

Part of the EasyCart project. See project LICENSE file.
