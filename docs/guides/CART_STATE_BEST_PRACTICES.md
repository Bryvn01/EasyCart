# Enterprise Cart State Management - Best Practices Guide

## Overview
This guide documents the enterprise-grade patterns and best practices used in the EasyCart mobile sticky mini-cart implementation. These patterns ensure reliability, performance, and maintainability at scale.

## Table of Contents
1. [State Management Patterns](#state-management-patterns)
2. [Concurrency & Race Condition Handling](#concurrency--race-condition-handling)
3. [Error Handling & Recovery](#error-handling--recovery)
4. [Performance Optimization](#performance-optimization)
5. [Accessibility](#accessibility)
6. [Testing Strategies](#testing-strategies)
7. [Mobile UI Reliability](#mobile-ui-reliability)

---

## State Management Patterns

### Single Source of Truth
**Pattern**: All cart state is managed in a single context provider with atomic updates.

```javascript
// ✅ GOOD: Centralized state management
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // ...
}

// ❌ BAD: Scattered state across multiple components
// Component A:
const [localCart, setLocalCart] = useState([]);
// Component B:
const [cartItems, setCartItems] = useState([]);
```

**Why**: Prevents state inconsistencies and makes debugging easier.

### Optimistic Updates with Rollback

**Pattern**: Update UI immediately, then sync with server. Rollback on error.

```javascript
const addToCart = async (productId, quantity) => {
  // Save previous state for rollback
  const previousCart = cart;
  const previousCount = cartCount;

  // Optimistic update
  setCartCount(prevCount => prevCount + quantity);

  try {
    await ordersAPI.addToCart({ product_id: productId, quantity });
    await fetchCart({ silent: true });
  } catch (error) {
    // Rollback on error
    setCart(previousCart);
    setCartCount(previousCount);
    throw error;
  }
};
```

**Why**: Provides instant feedback to users while maintaining data integrity.

### Immutable State Updates

**Pattern**: Always create new objects/arrays instead of mutating existing state.

```javascript
// ✅ GOOD: Immutable update
const updatedItems = cart.items.map(item =>
  item.id === itemId ? { ...item, quantity } : item
);
setCart({ ...cart, items: updatedItems });

// ❌ BAD: Direct mutation
cart.items[0].quantity = 5;
setCart(cart);
```

**Why**: Ensures React detects changes and re-renders correctly.

---

## Concurrency & Race Condition Handling

### Request Deduplication

**Pattern**: Prevent duplicate simultaneous requests using a Set to track pending operations.

```javascript
const pendingRequestsRef = useRef(new Set());

const addToCart = async (productId, quantity) => {
  const requestKey = `addToCart-${productId}`;

  // Prevent duplicate request
  if (pendingRequestsRef.current.has(requestKey)) {
    return; // Silently ignore
  }

  pendingRequestsRef.current.add(requestKey);

  try {
    await ordersAPI.addToCart({ product_id: productId, quantity });
  } finally {
    pendingRequestsRef.current.delete(requestKey);
  }
};
```

**Why**: Prevents issues from users rapidly clicking buttons or network delays.

### Memory Leak Prevention

**Pattern**: Use refs to track component mount status and cleanup on unmount.

```javascript
const isMountedRef = useRef(true);

useEffect(() => {
  isMountedRef.current = true;

  return () => {
    isMountedRef.current = false;
    // Cancel all pending requests
    abortControllersRef.current.forEach(controller => controller.abort());
    abortControllersRef.current.clear();
  };
}, []);

// Only update state if component is still mounted
if (isMountedRef.current) {
  setCart(data);
}
```

**Why**: Prevents "Can't perform a React state update on an unmounted component" warnings.

### Avoid Race Conditions in Async Operations

**Pattern**: Use request keys and cleanup to handle overlapping async operations.

```javascript
// ✅ GOOD: Track and deduplicate requests
const fetchCart = async () => {
  const requestKey = 'fetchCart';

  if (pendingRequestsRef.current.has(requestKey)) {
    return; // Already fetching
  }

  pendingRequestsRef.current.add(requestKey);
  // ... fetch logic
  pendingRequestsRef.current.delete(requestKey);
};

// ❌ BAD: No protection against overlapping calls
const fetchCart = async () => {
  const data = await ordersAPI.getCart();
  setCart(data); // May be stale if another request completed first
};
```

**Why**: Ensures consistent state even when multiple requests are triggered.

---

## Error Handling & Recovery

### Retry with Exponential Backoff

**Pattern**: Automatically retry failed requests with increasing delays.

```javascript
const fetchCart = async ({ retries = 2 } = {}) => {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await ordersAPI.getCart();
      return response.data;
    } catch (error) {
      attempt++;

      if (attempt > retries) {
        // Handle final failure
        setError({ message: 'Failed to load cart', code: 'FETCH_ERROR' });
        return null;
      }

      // Exponential backoff: 500ms, 1000ms, 2000ms
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, attempt) * 500)
      );
    }
  }
};
```

**Why**: Handles transient network errors gracefully without overwhelming the server.

### User-Friendly Error Messages

**Pattern**: Extract and display helpful error messages from API responses.

```javascript
catch (error) {
  const errorMessage = error.response?.data?.message
    || error.message
    || 'Something went wrong';

  setError({
    message: errorMessage,
    code: error.response?.status || 'UNKNOWN_ERROR'
  });
}
```

**Why**: Helps users understand what went wrong and how to proceed.

### Error State Management

**Pattern**: Errors are part of state with the ability to clear them.

```javascript
const [error, setError] = useState(null);

const clearError = useCallback(() => {
  if (isMountedRef.current) {
    setError(null);
  }
}, []);

// Provide to consumers
return (
  <CartContext.Provider value={{ error, clearError, ... }}>
    {children}
  </CartContext.Provider>
);
```

**Why**: Allows UI to display and dismiss errors appropriately.

---

## Performance Optimization

### Memoization with useCallback

**Pattern**: Memoize functions that are passed as dependencies or props.

```javascript
const fetchCart = useCallback(async ({ silent = false } = {}) => {
  // ... implementation
}, [isAuthenticated, calculateTotalItems]);
```

**Why**: Prevents unnecessary re-renders and infinite loops in useEffect.

### Debouncing User Input

**Pattern**: Delay execution of expensive operations until user stops interacting.

```javascript
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const debouncedUpdate = debounce((itemId, quantity) => {
  updateCartItem(itemId, quantity);
}, 500);
```

**Why**: Reduces API calls and improves perceived performance.

### Silent Background Updates

**Pattern**: Fetch updated data without showing loading indicators.

```javascript
await fetchCart({ silent: true });
```

**Why**: Keeps UI responsive while syncing data in background.

---

## Accessibility

### WCAG AA Compliance

**Pattern**: Follow Web Content Accessibility Guidelines Level AA.

#### Semantic HTML & ARIA

```javascript
<div
  className="sticky-mini-cart"
  role="complementary"
  aria-label="Shopping cart summary"
>
  <button
    aria-label={`View cart with ${cartCount} items, total ${total} KSh`}
    aria-busy={loading}
  >
    {/* ... */}
  </button>
</div>
```

#### Screen Reader Announcements

```javascript
<div
  ref={announcementRef}
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
/>
```

**Pattern**: Use `aria-live` regions to announce dynamic changes.

```javascript
useEffect(() => {
  if (cartCount !== prevCountRef.current) {
    const announcement = `${cartCount} items in cart`;
    if (announcementRef.current) {
      announcementRef.current.textContent = announcement;
    }
  }
}, [cartCount]);
```

#### Keyboard Navigation

```javascript
const handleKeyDown = (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    navigate('/cart');
  } else if (e.key === 'Escape' && error) {
    clearError();
  }
};
```

**Why**: Ensures all users can interact with the cart, regardless of input method.

### Focus Management

**Pattern**: Use visible focus indicators and proper tab order.

```css
.sticky-mini-cart-button:focus-visible {
  outline: 3px solid #10b981;
  outline-offset: 2px;
}
```

**Why**: Makes keyboard navigation clear and predictable.

---

## Testing Strategies

### Test Pyramid Approach

1. **Unit Tests (70%)**: Test individual functions and components
2. **Integration Tests (20%)**: Test component interactions
3. **E2E Tests (10%)**: Test complete user flows

### Mock API Consistently

**Pattern**: Use Jest mocks for API calls with realistic responses.

```javascript
jest.mock('../services/api', () => ({
  ordersAPI: {
    getCart: jest.fn(),
    addToCart: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  ordersAPI.getCart.mockResolvedValue({
    data: { items: [...], total_price: 1000 }
  });
});
```

### Test Edge Cases

**Critical scenarios to test:**
- Empty cart
- Network errors
- Concurrent requests
- Authentication state changes
- Malformed API responses
- Maximum item quantities
- Out of stock items

### Accessibility Testing

**Pattern**: Use jest-axe for automated accessibility testing.

```javascript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should have no accessibility violations', async () => {
  const { container } = render(<StickyMiniCart />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Mobile UI Reliability

### Responsive Animations

**Pattern**: Use CSS transitions with will-change for better performance.

```css
.sticky-mini-cart {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  will-change: transform, opacity;
}

.sticky-mini-cart.visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Why**: Smooth animations even on lower-end mobile devices.

### Touch Target Sizing

**Pattern**: Ensure interactive elements are at least 44x44px (iOS) or 48x48dp (Android).

```css
.sticky-mini-cart-button {
  min-height: 56px;
  padding: 12px 20px;
}
```

**Why**: Makes buttons easy to tap on mobile devices.

### Progressive Enhancement

**Pattern**: Basic functionality works without JavaScript, enhanced with JS.

```javascript
// Show loading state only when JavaScript is available
{loading && <LoadingSpinner />}

// Fallback content
<noscript>
  <div>Please enable JavaScript to use the shopping cart.</div>
</noscript>
```

**Why**: Ensures baseline functionality for all users.

### Mobile-First Breakpoints

**Pattern**: Design for mobile first, then enhance for larger screens.

```css
/* Mobile default */
.sticky-mini-cart {
  bottom: 70px;
  left: 12px;
  right: 12px;
}

/* Hide on desktop */
@media (min-width: 768px) {
  .sticky-mini-cart {
    display: none;
  }
}
```

**Why**: Optimizes experience for majority mobile users first.

---

## Common Pitfalls to Avoid

### ❌ Direct State Mutations
```javascript
// BAD
cart.items.push(newItem);
setCart(cart);

// GOOD
setCart({ ...cart, items: [...cart.items, newItem] });
```

### ❌ Missing Error Boundaries
```javascript
// BAD: No error handling for async operations
const addToCart = async (id) => {
  await api.addToCart(id);
};

// GOOD: Proper error handling
const addToCart = async (id) => {
  try {
    await api.addToCart(id);
  } catch (error) {
    setError(error);
    throw error; // Re-throw for caller to handle
  }
};
```

### ❌ Not Cleaning Up Side Effects
```javascript
// BAD: Memory leak
useEffect(() => {
  fetchCart();
}, []);

// GOOD: Cleanup on unmount
useEffect(() => {
  let cancelled = false;

  fetchCart().then(data => {
    if (!cancelled) setCart(data);
  });

  return () => { cancelled = true; };
}, []);
```

### ❌ Accessibility Afterthought
```javascript
// BAD: No ARIA labels
<button onClick={handleClick}>🛒 {count}</button>

// GOOD: Descriptive ARIA
<button
  onClick={handleClick}
  aria-label={`View cart with ${count} items`}
>
  🛒 {count}
</button>
```

---

## Maintenance Checklist

When modifying cart-related code:

- [ ] Does it maintain single source of truth?
- [ ] Are state updates immutable?
- [ ] Is there request deduplication?
- [ ] Are there proper error boundaries?
- [ ] Does it clean up on unmount?
- [ ] Are loading states handled?
- [ ] Is it accessible (WCAG AA)?
- [ ] Are there tests for edge cases?
- [ ] Does it work on mobile?
- [ ] Is it documented?

---

## Resources

- [React Hooks Best Practices](https://react.dev/reference/react)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Jest Testing Best Practices](https://jestjs.io/docs/tutorial-react)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## Support

For questions or issues with cart state management:
1. Check this guide first
2. Review the inline code documentation
3. Check existing tests for examples
4. Consult with the development team

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Author**: EasyCart Development Team
