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

## 📈 Future Enhancements

### Planned Features
- [ ] Firebase authentication integration
- [ ] Advanced filtering (price range slider)
- [ ] Product comparison
- [ ] Wishlist sharing
- [ ] Order tracking
- [ ] Push notifications
- [ ] PWA support
- [ ] Internationalization (i18n already configured)

### Performance
- [ ] Implement virtual scrolling for large lists
- [ ] Add service worker for offline support
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
