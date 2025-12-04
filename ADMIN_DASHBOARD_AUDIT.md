# Admin Dashboard Audit & Issues

## Critical Issues Found

### 1. ❌ API Configuration Error
**File:** `admin-dashboard/src/services/api.js`
**Issue:** `customersAPI` defined BEFORE axios instance
**Line:** 1-12 (before line 14 where `api` is created)
**Impact:** Runtime error - `api` is undefined when `customersAPI` tries to use it
**Fix:** Move `customersAPI` definition AFTER `api` instance creation

### 2. ⚠️ Missing Upload Image API
**File:** `admin-dashboard/src/pages/Products.js`
**Line:** 142 - `await adminAPI.uploadImage(formData)`
**Issue:** `uploadImage` method doesn't exist in `adminAPI`
**Impact:** Image uploads fail silently
**Fix:** Add `uploadImage` method to `adminAPI`

### 3. ⚠️ Wrong Auth Endpoint
**File:** `admin-dashboard/src/services/api.js`
**Line:** 82 - `/auth/login`
**Issue:** Should be `/auth/login/` (with trailing slash for Django)
**Impact:** Login may fail with 301 redirect
**Fix:** Add trailing slash to all endpoints

### 4. ⚠️ Missing Admin Orders Endpoint
**File:** `admin-dashboard/src/services/api.js`
**Line:** 122 - `api.get('/orders', { params })`
**Issue:** Should use admin endpoint `/orders/admin/orders/`
**Impact:** Regular users can't access orders
**Fix:** Use proper admin endpoint

### 5. ⚠️ No Error Boundary in Products
**File:** `admin-dashboard/src/pages/Products.js`
**Issue:** No error handling for failed API calls
**Impact:** App crashes on network errors
**Fix:** Add try-catch and error states

## Medium Priority Issues

### 6. 📊 No Dashboard Stats Implementation
**File:** `admin-dashboard/src/services/api.js`
**Line:** 107 - `getDashboardStats: () => api.get('/admin/dashboard')`
**Issue:** Backend endpoint doesn't exist
**Impact:** Dashboard page shows no data
**Fix:** Create backend endpoint for stats

### 7. 🔐 Weak Auth Token Storage
**File:** `admin-dashboard/src/services/api.js`
**Line:** 40 - `localStorage.getItem('admin_token')`
**Issue:** No token expiry check, no refresh logic
**Impact:** Security risk, poor UX
**Fix:** Add token refresh and expiry handling

### 8. 📱 No Mobile Responsiveness Check
**File:** `admin-dashboard/src/pages/Products.js`
**Issue:** Complex table layout may break on mobile
**Impact:** Poor mobile UX
**Fix:** Add responsive breakpoints

### 9. 🔍 No Input Validation
**File:** `admin-dashboard/src/pages/Products.js`
**Issue:** Form submits without proper validation
**Impact:** Bad data in database
**Fix:** Add validation before submit

### 10. ⏱️ No Loading States
**File:** Multiple pages
**Issue:** No skeleton loaders, just spinners
**Impact:** Poor perceived performance
**Fix:** Add skeleton screens

## Low Priority Issues

### 11. 🎨 Inconsistent UI Components
**Issue:** Mix of custom components and MUI
**Impact:** Inconsistent look and feel
**Fix:** Standardize on one UI library

### 12. 📝 No TypeScript
**Issue:** JavaScript only, no type safety
**Impact:** Runtime errors, poor DX
**Fix:** Migrate to TypeScript

### 13. 🧪 No Tests
**Issue:** No unit or integration tests
**Impact:** Bugs in production
**Fix:** Add Jest tests

### 14. 📊 No Analytics
**Issue:** No tracking of admin actions
**Impact:** Can't monitor usage
**Fix:** Add analytics events

### 15. 🔔 No Real-time Updates
**Issue:** Must refresh to see new orders
**Impact:** Delayed response to orders
**Fix:** Add WebSocket or polling

## Quick Fixes (Priority Order)

### Fix 1: API Configuration (CRITICAL)
```javascript
// Move customersAPI AFTER api instance
const api = axios.create({...});

// Then define customersAPI
export const customersAPI = {
  list: (params) => api.get('/auth/customers/', { params }),
  // ...
};
```

### Fix 2: Add Upload Image API
```javascript
export const adminAPI = {
  // ... existing methods
  uploadImage: (formData) => api.post('/products/admin/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
```

### Fix 3: Fix All Endpoints (Add trailing slashes)
```javascript
login: async (credentials) => {
  const response = await api.post('/auth/login/', credentials); // Added /
  return response;
},
```

### Fix 4: Add Dashboard Stats Endpoint
**Backend:** Create `backend/apps/admin/views.py`
```python
@api_view(['GET'])
def dashboard_stats(request):
    return Response({
        'total_products': Product.objects.count(),
        'total_orders': Order.objects.count(),
        'total_revenue': Order.objects.aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
        'pending_orders': Order.objects.filter(status='pending').count(),
    })
```

### Fix 5: Add Error Boundaries
```javascript
// Wrap Products component
<ErrorBoundary fallback={<ErrorFallback />}>
  <Products />
</ErrorBoundary>
```

## Testing Checklist

- [ ] Login with admin credentials
- [ ] View products list
- [ ] Create new product
- [ ] Edit existing product
- [ ] Delete product
- [ ] Upload product image
- [ ] Search products
- [ ] Filter by category
- [ ] Pagination works
- [ ] View orders
- [ ] Update order status
- [ ] View categories
- [ ] Create category
- [ ] Dashboard shows stats
- [ ] Logout works
- [ ] Token refresh works
- [ ] Mobile responsive
- [ ] Error handling works
- [ ] Loading states show

## Recommended Improvements

### 1. Add Dashboard Analytics
```javascript
// Dashboard.js
const stats = {
  totalRevenue: 'KSh 1,234,567',
  totalOrders: 1,234,
  pendingOrders: 45,
  totalProducts: 567,
  lowStockProducts: 12,
  newCustomers: 89
};
```

### 2. Add Bulk Operations
- ✅ Already implemented for products
- ❌ Missing for orders
- ❌ Missing for categories

### 3. Add Export Features
- ✅ CSV export for products
- ❌ PDF export for orders
- ❌ Excel export for reports

### 4. Add Notifications
```javascript
// Real-time order notifications
useEffect(() => {
  const interval = setInterval(() => {
    checkNewOrders();
  }, 30000); // Check every 30s
  return () => clearInterval(interval);
}, []);
```

### 5. Add User Management
- View all users
- Ban/unban users
- View user orders
- User analytics

## Performance Optimizations

1. **Lazy Loading**: ✅ Already implemented
2. **Image Optimization**: ❌ Add lazy loading for product images
3. **Pagination**: ✅ Already implemented
4. **Caching**: ❌ Add React Query for caching
5. **Code Splitting**: ✅ Already using lazy()

## Security Recommendations

1. **HTTPS Only**: Enforce HTTPS in production
2. **CSRF Protection**: Add CSRF tokens
3. **Rate Limiting**: Limit API calls
4. **Input Sanitization**: Sanitize all inputs
5. **Role-Based Access**: Check user role on every action
6. **Audit Logs**: Log all admin actions

## Next Steps

1. Fix critical API configuration issue
2. Add missing upload endpoint
3. Fix all endpoint trailing slashes
4. Add dashboard stats backend
5. Test all features
6. Add error boundaries
7. Improve mobile responsiveness
8. Add real-time notifications
9. Add user management
10. Add analytics tracking
