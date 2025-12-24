# Quick Reference: Responsive & Accessibility Classes

## Responsive Breakpoints

```css
/* Mobile First */
Base: 320px+    /* All devices */
sm:  480px+     /* Large phones */
md:  768px+     /* Tablets */
lg:  1024px+    /* Desktops */
xl:  1280px+    /* Large desktops */
xxl: 1440px+    /* Extra large */
```

## Common Classes

### Containers
```html
<div class="container">Max-width container with responsive padding</div>
<div class="container-fluid">Full-width with padding</div>
```

### Responsive Grid
```html
<div class="grid grid-cols-1 grid-cols-sm-2 grid-cols-md-3 grid-cols-lg-4">
  <!-- Auto-responsive grid: 1 col mobile, 2 phablet, 3 tablet, 4 desktop -->
</div>
```

### Visibility
```html
<div class="hidden-xs">Hide on mobile</div>
<div class="visible-xs">Show only on mobile</div>
<div class="hidden-md">Show on mobile, hide on desktop</div>
<div class="visible-md">Show only on desktop</div>
```

### Touch Targets
```html
<button class="touch-target">48x48px minimum</button>
<a class="nav-item">Navigation item</a>
<button class="icon-button">Icon button</button>
```

### Safe Areas (iOS)
```html
<header class="safe-top">Respects notch</header>
<footer class="safe-bottom">Respects home indicator</footer>
```

### Accessibility
```html
<!-- Screen reader only -->
<span class="sr-only">Description for screen readers</span>

<!-- Skip link (use in Layout) -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Loading states -->
<div class="loading-spinner" role="status"></div>
<div class="loading-skeleton"></div>

<!-- Error messages -->
<div class="error-message" role="alert">Error text</div>
```

### Aspect Ratios
```html
<div class="aspect-square">1:1 ratio</div>
<div class="aspect-video">16:9 ratio</div>
<div class="aspect-portrait">3:4 ratio</div>
```

### Flexbox Utilities
```html
<div class="flex items-center justify-between gap-4">
  <!-- Flexbox with center alignment and 1rem gap -->
</div>
```

## Component Usage

### ResponsiveImage
```jsx
import ResponsiveImage from './components/ui/ResponsiveImage';

<ResponsiveImage
  src="/images/product.jpg"
  alt="Product name"
  aspectRatio="1/1"
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="lazy" // or "eager" for above-fold
  priority={false} // Set true for LCP images
/>
```

### Layout with Skip Link
```jsx
import Layout from './components/Layout';

<Layout showBottomNav={true}>
  <YourPageContent />
</Layout>
```

## ARIA Attributes

### Buttons
```html
<button aria-label="Close dialog">×</button>
<button aria-pressed="true">Toggle</button>
<button aria-expanded="false">Menu</button>
<button disabled aria-disabled="true">Submit</button>
```

### Navigation
```html
<nav role="navigation" aria-label="Main navigation">
  <a href="/" aria-current="page">Home</a>
</nav>
```

### Forms
```html
<label for="email">Email <span class="required"></span></label>
<input
  id="email"
  type="email"
  aria-invalid="false"
  aria-describedby="email-error"
/>
<div id="email-error" class="error-message" role="alert">
  Please enter a valid email
</div>
```

### Live Regions
```html
<div role="status" aria-live="polite">Item added to cart</div>
<div role="alert" aria-live="assertive">Error: Payment failed</div>
```

## CSS Custom Properties

### Breakpoints
```css
var(--breakpoint-xs)   /* 320px */
var(--breakpoint-sm)   /* 480px */
var(--breakpoint-md)   /* 768px */
var(--breakpoint-lg)   /* 1024px */
var(--breakpoint-xl)   /* 1280px */
var(--breakpoint-xxl)  /* 1440px */
```

### Safe Areas
```css
var(--safe-area-inset-top)
var(--safe-area-inset-bottom)
var(--safe-area-inset-left)
var(--safe-area-inset-right)
```

### Touch
```css
var(--touch-target-min)     /* 48px */
var(--touch-spacing-min)    /* 8px */
```

## Testing Commands

```bash
# Start dev server
npm start

# Run accessibility tests (if configured)
npm run test:a11y

# Check with Lighthouse
# Open Chrome DevTools > Lighthouse tab

# Test with screen reader
# Windows: NVDA (free)
# Mac: VoiceOver (Cmd+F5)
# Chrome: ChromeVox extension
```

## Browser DevTools

### Responsive Testing
1. Open Chrome DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Test these viewports:
   - iPhone 12 Pro (390x844)
   - Pixel 5 (393x851)
   - iPad Air (820x1180)
   - iPad Pro (1024x1366)

### Accessibility Testing
1. Open DevTools > Lighthouse
2. Select "Accessibility" only
3. Run audit
4. Fix issues with score < 90

## Common Patterns

### Product Grid
```jsx
<div className="container">
  <div className="grid grid-cols-1 grid-cols-sm-2 grid-cols-md-3 grid-cols-lg-4 gap-4">
    {products.map(product => (
      <div key={product.id} className="card">
        <ResponsiveImage
          src={product.image}
          alt={product.name}
          aspectRatio="1/1"
        />
        <h3>{product.name}</h3>
        <button className="btn touch-target">Add to Cart</button>
      </div>
    ))}
  </div>
</div>
```

### Modal Dialog
```jsx
<>
  <div className="modal-backdrop" onClick={onClose} />
  <div role="dialog" aria-labelledby="dialog-title" aria-modal="true">
    <h2 id="dialog-title">Dialog Title</h2>
    <button onClick={onClose} aria-label="Close dialog">×</button>
    {/* Content */}
  </div>
</>
```

### Form with Validation
```jsx
<form>
  <div>
    <label htmlFor="email" className="required">Email</label>
    <input
      id="email"
      type="email"
      aria-invalid={hasError}
      aria-describedby={hasError ? "email-error" : undefined}
    />
    {hasError && (
      <div id="email-error" className="error-message" role="alert">
        Please enter a valid email
      </div>
    )}
  </div>
</form>
```

## Pro Tips

1. **Always use semantic HTML**: `<button>` not `<div onclick>`
2. **Every image needs alt text**: Describe the content
3. **Test keyboard navigation**: Tab through your UI
4. **Use skip links**: Let users jump to content
5. **Respect user preferences**: reduced-motion, high-contrast
6. **48px minimum touch targets**: Make it easy to tap
7. **16px input font size**: Prevents iOS zoom
8. **Lazy load images**: Better performance
9. **Use proper ARIA**: But HTML semantics first
10. **Test on real devices**: Emulators aren't enough

---

**Questions?** Check `RESPONSIVE_ENHANCEMENTS_SUMMARY.md` for full documentation.
