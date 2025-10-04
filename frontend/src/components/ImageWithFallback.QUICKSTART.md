# ImageWithFallback - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Import the Component

```javascript
import ImageWithFallback from './components/ImageWithFallback';
```

### 2. Replace Your Image Tags

**Before:**
```javascript
<img 
  src={product.image} 
  alt={product.name}
  onError={handleError}
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

### 3. Done! 🎉

That's it! Your images now have:
- ✅ Automatic error handling
- ✅ Beautiful loading skeletons
- ✅ Lazy loading optimization
- ✅ Environment-based URLs
- ✅ Retry logic

## 📋 Common Use Cases

### Product Card
```javascript
<ImageWithFallback
  src={product.image}
  alt={product.name}
  fallbackCategory="product"
  className="w-full h-full object-cover"
/>
```

### Category Card
```javascript
<ImageWithFallback
  src={category.image}
  alt={category.name}
  fallbackCategory="category"
  lazy={true}
/>
```

### Hero Image
```javascript
<ImageWithFallback
  src={hero.image}
  alt={hero.title}
  fallbackCategory="hero"
  lazy={false}  // Load immediately
/>
```

## 🔧 Configuration

Set environment variable in `.env`:
```bash
REACT_APP_IMAGE_BASE_URL=http://localhost:8000
```

## 📚 Full Documentation

For complete documentation, see:
- `ImageWithFallback.README.md` - Full usage guide
- `ImageWithFallback.examples.js` - 10 integration examples
- `IMAGE_SYSTEM_IMPLEMENTATION.md` - Implementation details

## ✅ Features

| Feature | Included |
|---------|----------|
| Error Handling | ✅ |
| Lazy Loading | ✅ |
| Skeleton Screens | ✅ |
| URL Resolution | ✅ |
| Retry Logic | ✅ |
| Accessibility | ✅ |
| Dark Mode | ✅ |
| Performance Monitoring | ✅ |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run ImageWithFallback tests
npm test -- ImageWithFallback.test.js
```

All 54 tests passing! (30 original + 24 new)

## 🎨 CSS Utilities

Optional CSS utilities available in `ImageWithFallback.css`:

```javascript
// Container with aspect ratio
<div className="image-container image-container--square">
  <ImageWithFallback ... className="img-cover" />
</div>
```

## 🆘 Need Help?

1. Check examples: `ImageWithFallback.examples.js`
2. Read docs: `ImageWithFallback.README.md`
3. Run tests: `npm test -- ImageWithFallback.test.js`

---

**That's all you need to know to get started!** 🚀
