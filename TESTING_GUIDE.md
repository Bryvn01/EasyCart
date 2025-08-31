# Wishlist & Review Features Testing Guide

## Backend API Testing

### Prerequisites
- Django server running on http://localhost:8000
- Valid authentication token for protected endpoints

### Wishlist API Endpoints

#### 1. Get User Wishlist
```bash
curl -X GET http://localhost:8000/api/products/wishlist/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 2. Add to Wishlist
```bash
curl -X POST http://localhost:8000/api/products/wishlist/add/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1}'
```

#### 3. Remove from Wishlist
```bash
curl -X DELETE http://localhost:8000/api/products/wishlist/remove/1/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4. Check Wishlist Status
```bash
curl -X GET http://localhost:8000/api/products/wishlist/check/1/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Review API Endpoints

#### 1. Get Product Reviews
```bash
curl -X GET http://localhost:8000/api/products/reviews/1/
```

#### 2. Create Review
```bash
curl -X POST http://localhost:8000/api/products/reviews/create/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product": 1,
    "rating": 5,
    "title": "Excellent product",
    "comment": "This product exceeded my expectations",
    "is_verified_purchase": true
  }'
```

#### 3. Mark Review Helpful
```bash
curl -X POST http://localhost:8000/api/products/reviews/helpful/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "review_id": 1,
    "is_helpful": true
  }'
```

## Frontend UI Testing

### Test Scenarios

#### 1. Wishlist Functionality
- [ ] Login to the application
- [ ] Navigate to Products page
- [ ] Click "Wishlist" button on multiple products
- [ ] Verify toast notifications appear
- [ ] Navigate to Wishlist page (/wishlist)
- [ ] Verify all added products appear
- [ ] Test "Remove" button functionality
- [ ] Test "Add to Cart" button from wishlist
- [ ] Test wishlist persistence after logout/login

#### 2. Review Functionality
- [ ] Navigate to Product Detail page
- [ ] Verify review section is visible
- [ ] Submit a review (requires purchase verification)
- [ ] Test rating validation (1-5 stars)
- [ ] Test "Helpful" button functionality
- [ ] Verify reviews display correctly with user info

#### 3. Error Handling
- [ ] Test wishlist actions without authentication
- [ ] Test adding duplicate items to wishlist
- [ ] Test invalid product IDs
- [ ] Test review submission with invalid data

### Expected Behaviors

#### Wishlist:
- ✅ Add/remove items with proper feedback
- ✅ Maintain state across sessions
- ✅ Proper error handling for unauthorized access
- ✅ Sync with backend database

#### Reviews:
- ✅ Display existing reviews correctly
- ✅ Submit new reviews with validation
- ✅ Mark reviews as helpful
- ✅ Show verified purchase badges

## Database Verification

After testing, verify database entries:
```sql
-- Check wishlist items
SELECT * FROM products_wishlist;
SELECT * FROM products_wishlistitem;

-- Check reviews
SELECT * FROM products_review;
SELECT * FROM products_reviewhelpful;
```

## Performance Testing

- Load test with multiple concurrent wishlist operations
- Test review pagination with large datasets
- Verify response times for all endpoints

## Security Testing

- Test authentication requirements for all endpoints
- Verify input sanitization and SQL injection prevention
- Test cross-user data isolation
- Verify proper error messages (no sensitive data leakage)
