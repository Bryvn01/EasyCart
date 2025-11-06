# EasyCart Frontend Implementation Guide

## 🎨 Design System & UI Components

### Color Palette
EasyCart uses a professional, friendly color palette with soft neutrals and accent colors:

**Primary Colors (Blue)**
- `primary-50` to `primary-900`: Main brand colors
- Used for CTAs, links, and primary actions

**Accent Colors (Purple)**
- `accent-50` to `accent-900`: Secondary brand colors
- Used for highlights and special features

**Semantic Colors**
- `success-*`: Green shades for success states
- `warning-*`: Orange shades for warnings
- `error-*`: Red shades for errors

**Dark Mode Support**
All components support dark mode with `dark:` prefixes.

### Typography
- Font Family: Inter (system-ui fallback)
- Responsive sizing with mobile-first approach
- Proper hierarchy with heading and body text styles

### Component Library

#### Button Component (`/components/ui/Button.js`)
Enhanced with accessibility features:
- ARIA labels and busy states
- Loading spinner with aria-hidden
- Dark mode support
- Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`
- Sizes: `sm`, `md`, `lg`

```jsx
<Button
  variant="primary"
  size="md"
  loading={isLoading}
  ariaLabel="Add to cart"
>
  Add to Cart
</Button>
```

#### Card Component (`/components/ui/Card.js`)
Flexible card system with:
- Dark mode support
- Hover animations
- Sub-components: Header, Content, Footer
- Consistent shadows and borders

```jsx
<Card hover>
  <Card.Header>Title</Card.Header>
  <Card.Content>Content</Card.Content>
  <Card.Footer>Footer</Card.Footer>
</Card>
```

#### Input Component (`/components/ui/Input.js`)
Accessible form inputs with:
- Automatic ID generation
- Error states with ARIA attributes
- Required field indicators
- Dark mode support

```jsx
<Input
  label="Email"
  type="email"
  required
  error={errors.email}
/>
```


#### ProductCard Component (`/components/ProductCard.js`)
Enhanced product display with:
- Image lazy loading
- Stock indicators
- Out of stock overlay
- Smooth hover animations
- Price formatting
- Robust image fallback (shows placeholder if image fails)

#### ProductEditModal Component (`/components/ProductEditModal.js`)
**Flexible image handling:**
- Users can either upload an image file (JPG, PNG, GIF, under 5MB) or provide an image URL (must be a direct link to an image)
- Only one (file or URL) is accepted at a time; uploading a file clears the URL and vice versa
- Image preview updates live as the user selects a file or enters a URL
- Client-side validation for file type, size, and URL format
- Accessible error messages and alt text for previews
- Form automatically submits the correct format to the backend (FormData for file, JSON for URL)

#### ProductGridSkeleton (`/components/ui/ProductSkeleton.js`)
Loading state placeholder:
- Animated pulse effect
- Configurable count
- Maintains layout during load

## 🔒 Authentication & Authorization

### Protected Routes
Implemented via `ProtectedRoute` component:

```jsx
<Route path="/cart" element={
  <ProtectedRoute>
    <Cart />
  </ProtectedRoute>
} />

<Route path="/admin" element={
  <ProtectedRoute requireAdmin={true}>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

### JWT Token Management
- Automatic token attachment via axios interceptor
- Token refresh on 401 errors
- Secure token storage in localStorage
- Auto-logout on refresh failure

## 🔄 State Management

### Product State Refresh
Products automatically refresh across components using browser events:

```javascript
// After CRUD operation
window.dispatchEvent(new Event('easycart-products-updated'));

// In consuming components
useEffect(() => {
  const handleUpdate = () => fetchProducts();
  window.addEventListener('easycart-products-updated', handleUpdate);
  return () => window.removeEventListener('easycart-products-updated', handleUpdate);
}, []);
```

### Cart State
- Context API for global cart state
- Auto-refresh after cart operations
- Persistent cart count in navbar

## 🚨 Error Handling

### Error Handler Utility (`/utils/errorHandler.js`)
Centralized error handling:

```javascript
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';

try {
  await api.someAction();
  handleApiSuccess('Action completed!');
} catch (error) {
  handleApiError(error, 'Action failed');
}
```

Features:
- User-friendly error messages
- Network error detection
- Validation error handling
- Toast notifications for all states

## 🎉 Toast Notifications

### Configuration
Enhanced toast styling in `App.js`:
- Custom colors for success/error/loading
- Proper positioning
- Auto-dismiss timers
- Icon themes

### Usage
```javascript
import { handleApiSuccess, handleApiError, handleApiLoading } from '../utils/errorHandler';

const toastId = handleApiLoading('Processing...');
// ... do work
dismissToast(toastId);
handleApiSuccess('Done!');
```

## ♿ Accessibility Features

### ARIA Support
- All interactive elements have proper ARIA labels
- Form inputs have error associations
- Loading states indicated with aria-busy
- Required fields marked visually and semantically

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus states clearly visible
- Logical tab order

### Screen Reader Support
- Semantic HTML elements
- Descriptive alt text for images
- Error announcements via role="alert"

## 📱 Responsive Design

### Mobile-First Approach
- All components responsive by default
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Touch-friendly target sizes
- Optimized mobile navigation

### Grid Layouts
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {/* Products */}
</div>
```

## 🎬 Animations & Transitions

### Tailwind Animations
- `animate-fade-in`: Smooth fade-in on mount
- `animate-slide-up`: Slide up animation
- `animate-scale-up`: Scale up animation
- `animate-pulse`: Loading skeleton

### Component Transitions
- Hover effects on cards and buttons
- Smooth color transitions
- Transform animations (scale, translate)

## 🚀 Performance Optimizations


### Image Loading
- Lazy loading with `loading="lazy"`
- Responsive images
- Placeholder images
- Robust fallback for missing or broken images

### Code Splitting
- React.lazy for route-based splitting
- Suspense boundaries with loading states

### Bundle Size
- Current gzipped size: ~238 KB (JS) + ~7 KB (CSS)
- Optimized production build
- Tree shaking enabled


## 🧪 Testing

### Current Coverage
- 7/7 tests passing
- Products page fully tested
- ProductEditModal tested for file upload, image URL, preview, and validation
- Loading states verified
- Error handling covered

### Running Tests
```bash
npm test                    # Run tests in watch mode
npm test -- --watchAll=false  # Run tests once
npm run build              # Production build
```

## 🌍 Environment Configuration

### Required Variables
Create `.env` file:
```
REACT_APP_API_URL=https://easycart-backend-0u8r.onrender.com/api
```

### Development vs Production
- Local: `http://localhost:8000/api`
- Production: `https://easycart-backend-0u8r.onrender.com/api`

## 🛠️ Development Workflow

### Setup
```bash
cd frontend
npm install
npm start
```

### Building
```bash
npm run build
npm run build:ts  # TypeScript compilation (if enabled)
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## 📦 Deployment

### Production Build
```bash
npm run build
# Output in /build directory
```

### Environment Setup
1. Set `REACT_APP_API_URL` to production backend
2. Configure CORS on backend
3. Deploy build folder to static hosting

### Render Deployment
- Build command: `npm run build`
- Publish directory: `build`
- Add environment variables in Render dashboard

## 🔐 Security Best Practices

### Implemented
- JWT tokens in Authorization headers
- Secure token refresh mechanism
- Protected routes with authentication checks
- Input validation and sanitization
- XSS prevention through React escaping

### TODO
- Implement rate limiting awareness
- Add CSRF token support (if backend requires)
- Content Security Policy headers

## 📱 Progressive Web App (PWA) Support

### Overview
EasyCart now includes full Progressive Web App capabilities, enabling users to install the app on their devices and use it offline.

### Features Implemented

#### 1. Web App Manifest (`/public/manifest.json`)
- **App Identity**: Short name, full name, and description
- **App Icons**: SVG icons for 192x192 and 512x512 sizes
- **Display Mode**: Standalone for native app-like experience
- **Theme Colors**: Matching brand colors (#2563eb)
- **App Shortcuts**: Quick access to Products, Cart, and Orders
- **Orientation**: Portrait-primary for optimal mobile experience

#### 2. Service Worker (`/public/service-worker.js`)
Comprehensive offline support with multiple caching strategies:

**Caching Strategies**:
- **Static Assets**: Cache-first for HTML, CSS, JS files
- **API Requests**: Network-first with cache fallback
- **Images**: Cache-first with automatic caching
- **Runtime Caching**: Dynamic content cached on first access

**Features**:
- Offline fallback for navigation requests
- Background sync for cart and order data
- Push notification support (foundation for future features)
- Automatic cache cleanup on updates

#### 3. Service Worker Registration (`/src/serviceWorkerRegistration.js`)
Handles the lifecycle of the service worker:
- Automatic registration on app load
- Update notifications with refresh prompt
- Network status detection
- Install prompt management
- PWA detection utilities

#### 4. Network Status Component (`/components/NetworkStatus.js`)
Real-time online/offline status indicator:
- Automatic network change detection
- User-friendly notifications
- Accessible with ARIA live regions
- Mobile-responsive positioning
- Auto-dismiss after 3 seconds

#### 5. Install PWA Component (`/components/InstallPWA.js`)
Smart app installation prompt:
- Detects if app is already installed
- Shows install prompt after 3-second delay
- Dismissable with 7-day cooldown
- Native app-like UI
- Mobile-responsive design

### Mobile Enhancements

#### Touch Optimizations
All interactive elements meet WCAG touch target guidelines:
- Minimum 44x44px tap targets
- Touch-action manipulation for better performance
- Custom tap highlights with brand colors
- Reduced tap highlight on touch devices

#### Viewport & Safe Areas
- Optimized viewport meta tags with proper scaling
- Safe area insets for notched devices (iPhone X+)
- Pull-to-refresh disabled for better PWA experience
- Smooth scrolling with webkit support

#### Performance on Mobile
- Font-size optimization to prevent iOS zoom
- Landscape orientation adjustments
- High DPI screen support
- Reduced animations on low-end devices
- Connection-aware image loading

#### iOS PWA Support
Special meta tags for iOS devices:
- Apple mobile web app capable
- Status bar styling
- App title configuration
- Touch icon for home screen

### Usage

#### Installing the PWA
1. **Desktop**: Click the install icon in the browser address bar
2. **Mobile**: Tap the install prompt or use "Add to Home Screen" from browser menu
3. **Auto-prompt**: App shows install prompt automatically after 3 seconds (dismissable)

#### Offline Mode
- App works offline for cached pages and data
- Network status indicator shows when offline
- Cached data served when network unavailable
- Automatic sync when connection restored

#### Update Handling
When a new version is available:
1. Service worker detects update
2. User sees update notification banner
3. Click "Update Now" to refresh
4. New version loads immediately

### SEO & Performance

#### Meta Tags
- Open Graph tags for social sharing
- Twitter Card support
- Proper viewport configuration
- Theme color for browser chrome
- Preconnect hints for external resources

#### Performance Optimizations
- DNS prefetch for critical domains
- Resource hints for faster loading
- Optimized bundle sizes
- Lazy loading for images
- Code splitting with React.lazy

#### Robots & Sitemap
- `robots.txt` configured for SEO
- Admin routes excluded from indexing
- Sitemap placeholder for future enhancement

## 📈 Future Enhancements

### Planned Features
- [ ] Firebase authentication integration
- [ ] Advanced filtering (price range slider)
- [ ] Product comparison
- [ ] Wishlist sharing
- [ ] Order tracking
- [x] Push notifications (foundation implemented)
- [x] PWA support ✅ **COMPLETED**
- [ ] Internationalization (i18n already configured)

### Performance
- [ ] Implement virtual scrolling for large lists
- [x] Add service worker for offline support ✅ **COMPLETED**
- [ ] Optimize image delivery with CDN

## 🤝 Contributing

### Code Style
- Use functional components with hooks
- PropTypes for type checking
- Consistent naming conventions
- Comments for complex logic

### Component Structure
```
Component.js
├── Imports
├── PropTypes (if applicable)
├── Component definition
├── PropTypes validation
└── Export
```

## 📞 Support

For issues or questions:
- GitHub Issues: [EasyCart Repository](https://github.com/Bryvn01/EasyCart/issues)
- Email: support@easycart.co.ke
