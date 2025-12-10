# Complete User Flow Test - Manual Testing Guide

## Test Environment
- **Backend**: http://127.0.0.1:8000 (local) or https://easycart-backend-2k8l.onrender.com (production)
- **Frontend**: http://localhost:3000 (local) or https://easycart-frontend-wj9x.onrender.com (production)

## Prerequisites
- Django server running: `cd backend && python manage.py runserver`
- Database migrations applied
- At least one product in database

---

## Test Flow Overview

```
1. OTP Request
2. OTP Verification
3. User Login (JWT tokens)
4. Profile Update
5. Browse Products
6. Add to Cart
7. View Cart
8. Update Cart Quantity
9. Checkout (Create Order)
10. View Order History
11. View OTP Analytics
```

---

## Step-by-Step API Testing

### ✅ STEP 1: Request OTP

**Endpoint**: `POST /api/auth/otp/request/`

**Request**:
```bash
POST http://127.0.0.1:8000/api/auth/otp/request/
Content-Type: application/json

{
  "identifier": "+254723796116",
  "method": "console"
}
```

**Expected Response** (200 OK):
```json
{
  "message": "OTP sent via console (check server logs)",
  "identifier": "+254723796116",
  "is_new_user": false,
  "expires_in": 600,
  "can_resend_after": 60
}
```

**Verification**:
- ✓ Check Django console for: `📱 [CONSOLE] OTP for +254723796116: XXXXXX`
- ✓ Note down the 6-digit OTP code
- ✓ Response includes expiration time (600 seconds = 10 minutes)

---

### ✅ STEP 2: Verify OTP and Login

**Endpoint**: `POST /api/auth/otp/verify/`

**Request**:
```bash
POST http://127.0.0.1:8000/api/auth/otp/verify/
Content-Type: application/json

{
  "identifier": "+254723796116",
  "otp_code": "123456"  # Use actual OTP from Step 1
}
```

**Expected Response** (200 OK):
```json
{
  "message": "Login successful",
  "access": "eyJ0eXAiOiJKV1QiLCJhbG...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJh...",
  "user": {
    "id": 7,
    "email": "3796116@easycart.temp",
    "phone_number": "+254723796116",
    "first_name": "",
    "last_name": ""
  },
  "is_profile_complete": false
}
```

**Verification**:
- ✓ Access token received
- ✓ User ID present
- ✓ Phone number matches
- ✓ Save access token for subsequent requests

**Save Token**:
```
TOKEN=<access_token_from_response>
```

---

### ✅ STEP 3: Update User Profile

**Endpoint**: `PATCH /api/auth/profile/`

**Request**:
```bash
PATCH http://127.0.0.1:8000/api/auth/profile/
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+254723796116"
}
```

**Expected Response** (200 OK):
```json
{
  "id": 7,
  "username": "user_3796116",
  "email": "3796116@easycart.temp",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+254723796116",
  "address": ""
}
```

**Verification**:
- ✓ first_name and last_name updated
- ✓ Profile is now complete

---

### ✅ STEP 4: Browse Products

**Endpoint**: `GET /api/products/`

**Request**:
```bash
GET http://127.0.0.1:8000/api/products/
```

**Expected Response** (200 OK):
```json
{
  "count": 24,
  "next": "http://127.0.0.1:8000/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Wireless Mouse",
      "slug": "wireless-mouse",
      "description": "Ergonomic wireless mouse with long battery life",
      "price": "1500.00",
      "stock_quantity": 50,
      "category": {
        "id": 1,
        "name": "Electronics",
        "slug": "electronics"
      },
      "images": [...]
    },
    ...
  ]
}
```

**Verification**:
- ✓ Products list returned
- ✓ Each product has id, name, price, stock_quantity
- ✓ Save a product ID for cart testing

**Save Product ID**:
```
PRODUCT_ID=1  # From first product in results
```

---

### ✅ STEP 5: Add Product to Cart

**Endpoint**: `POST /api/cart/add/`

**Request**:
```bash
POST http://127.0.0.1:8000/api/cart/add/
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2
}
```

**Expected Response** (201 Created):
```json
{
  "id": 123,
  "product": 1,
  "product_name": "Wireless Mouse",
  "quantity": 2,
  "price": "1500.00",
  "subtotal": "3000.00",
  "created_at": "2025-12-10T14:20:00Z"
}
```

**Verification**:
- ✓ Cart item created
- ✓ Subtotal calculated correctly (price × quantity)
- ✓ Save cart item ID

**Save Cart Item ID**:
```
CART_ITEM_ID=123
```

---

### ✅ STEP 6: View Shopping Cart

**Endpoint**: `GET /api/cart/`

**Request**:
```bash
GET http://127.0.0.1:8000/api/cart/
Authorization: Bearer {TOKEN}
```

**Expected Response** (200 OK):
```json
{
  "items": [
    {
      "id": 123,
      "product": 1,
      "product_name": "Wireless Mouse",
      "quantity": 2,
      "price": "1500.00",
      "subtotal": "3000.00"
    }
  ],
  "total": "3000.00",
  "item_count": 1
}
```

**Verification**:
- ✓ All cart items listed
- ✓ Total calculated correctly
- ✓ Item count matches

---

### ✅ STEP 7: Update Cart Item Quantity

**Endpoint**: `PATCH /api/cart/{cart_item_id}/`

**Request**:
```bash
PATCH http://127.0.0.1:8000/api/cart/123/
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "quantity": 3
}
```

**Expected Response** (200 OK):
```json
{
  "id": 123,
  "product": 1,
  "product_name": "Wireless Mouse",
  "quantity": 3,
  "price": "1500.00",
  "subtotal": "4500.00"
}
```

**Verification**:
- ✓ Quantity updated
- ✓ Subtotal recalculated (1500 × 3 = 4500)

---

### ✅ STEP 8: Checkout (Create Order)

**Endpoint**: `POST /api/orders/checkout/`

**Request**:
```bash
POST http://127.0.0.1:8000/api/orders/checkout/
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "shipping_address": "123 Kenyatta Avenue, Nairobi, Kenya",
  "payment_method": "mpesa",
  "phone_number": "+254723796116"
}
```

**Expected Response** (201 Created):
```json
{
  "id": 45,
  "user": 7,
  "total_amount": "4500.00",
  "status": "pending",
  "payment_method": "mpesa",
  "shipping_address": "123 Kenyatta Avenue, Nairobi, Kenya",
  "created_at": "2025-12-10T14:25:00Z",
  "items": [
    {
      "product": 1,
      "product_name": "Wireless Mouse",
      "quantity": 3,
      "price": "1500.00"
    }
  ],
  "mpesa_checkout_request_id": "ws_CO_10122025142500..."
}
```

**Verification**:
- ✓ Order created successfully
- ✓ Total amount matches cart total
- ✓ Status is "pending"
- ✓ M-Pesa checkout request initiated
- ✓ Cart should now be empty

**Save Order ID**:
```
ORDER_ID=45
```

---

### ✅ STEP 9: View Order History

**Endpoint**: `GET /api/orders/`

**Request**:
```bash
GET http://127.0.0.1:8000/api/orders/
Authorization: Bearer {TOKEN}
```

**Expected Response** (200 OK):
```json
{
  "count": 1,
  "results": [
    {
      "id": 45,
      "total_amount": "4500.00",
      "status": "pending",
      "payment_method": "mpesa",
      "shipping_address": "123 Kenyatta Avenue, Nairobi, Kenya",
      "created_at": "2025-12-10T14:25:00Z",
      "items": [...]
    }
  ]
}
```

**Verification**:
- ✓ Order appears in history
- ✓ Order details are correct
- ✓ Most recent order first

---

### ✅ STEP 10: Get Specific Order Details

**Endpoint**: `GET /api/orders/{order_id}/`

**Request**:
```bash
GET http://127.0.0.1:8000/api/orders/45/
Authorization: Bearer {TOKEN}
```

**Expected Response** (200 OK):
```json
{
  "id": 45,
  "user": 7,
  "total_amount": "4500.00",
  "status": "pending",
  "payment_method": "mpesa",
  "shipping_address": "123 Kenyatta Avenue, Nairobi, Kenya",
  "created_at": "2025-12-10T14:25:00Z",
  "updated_at": "2025-12-10T14:25:00Z",
  "items": [
    {
      "id": 67,
      "product": 1,
      "product_name": "Wireless Mouse",
      "quantity": 3,
      "price": "1500.00",
      "subtotal": "4500.00"
    }
  ]
}
```

**Verification**:
- ✓ Detailed order information
- ✓ All order items listed
- ✓ Timestamps present

---

### ✅ STEP 11: View OTP Delivery Analytics

**Endpoint**: `GET /api/auth/otp/analytics/`

**Request**:
```bash
GET http://127.0.0.1:8000/api/auth/otp/analytics/
```

**Expected Response** (200 OK):
```json
{
  "period": {
    "start": "2025-12-03T00:00:00Z",
    "end": "2025-12-10T17:00:00Z",
    "days": 7
  },
  "overview": {
    "total_deliveries": 1,
    "successful": 1,
    "failed": 0,
    "success_rate": 100.0
  },
  "by_method": [
    {
      "method": "console",
      "total": 1,
      "successful": 1,
      "failed": 0,
      "success_rate": 100.0
    }
  ],
  "recommendations": []
}
```

**Verification**:
- ✓ Analytics data returned
- ✓ Current OTP request logged
- ✓ Success rate calculated
- ✓ Method breakdown shown

---

## Test Results Checklist

### Authentication Flow
- [ ] OTP request successful
- [ ] OTP received in console
- [ ] OTP verification successful
- [ ] JWT tokens received
- [ ] Profile update successful

### Shopping Flow
- [ ] Products list retrieved
- [ ] Product added to cart
- [ ] Cart contents viewable
- [ ] Cart quantity updatable
- [ ] Checkout creates order
- [ ] Order history accessible
- [ ] Order details retrievable

### Analytics
- [ ] OTP analytics accessible
- [ ] Delivery logged correctly
- [ ] Success rate tracked

---

## Common Issues & Solutions

### Issue: "OTP expired"
**Solution**: OTPs expire after 10 minutes. Request a new one.

### Issue: "Please wait X seconds"
**Solution**: 60-second cooldown between requests. Wait and retry.

### Issue: "Invalid credentials or OTP expired"
**Solution**: Check OTP code is correct and not expired.

### Issue: "Product out of stock"
**Solution**: Choose a product with `stock_quantity > 0`.

### Issue: "Authentication credentials were not provided"
**Solution**: Include `Authorization: Bearer {token}` header.

### Issue: "Cart is empty"
**Solution**: Add products to cart before checkout.

---

## Quick Test Using cURL (PowerShell)

```powershell
# Step 1: Request OTP
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/otp/request/" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"identifier":"+254723796116","method":"console"}'

# Check server console for OTP, then verify:
$otpCode = "123456"  # Replace with actual OTP

# Step 2: Verify OTP
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/otp/verify/" `
  -Method Post `
  -ContentType "application/json" `
  -Body "{\"identifier\":\"+254723796116\",\"otp_code\":\"$otpCode\"}"

$token = $response.access

# Step 3: Browse Products
$products = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/products/"
$productId = $products.results[0].id

# Step 4: Add to Cart
$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

$cart = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/cart/add/" `
  -Method Post `
  -Headers $headers `
  -Body "{\"product_id\":$productId,\"quantity\":2}"

# Step 5: Checkout
$order = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/orders/checkout/" `
  -Method Post `
  -Headers $headers `
  -Body '{"shipping_address":"123 Test St","payment_method":"mpesa","phone_number":"+254723796116"}'

Write-Host "✅ Order Created: #$($order.id)"
```

---

## Production Testing

Replace `http://127.0.0.1:8000` with `https://easycart-backend-2k8l.onrender.com` and test the same flow.

**Production-Specific Checks**:
- [ ] CORS headers allow frontend domain
- [ ] HTTPS connections work
- [ ] OTP delivery (console logs on Render)
- [ ] Database persistence
- [ ] Static files load correctly

---

## Test Coverage Summary

| Feature | Endpoint | Method | Auth Required | Status |
|---------|----------|--------|---------------|--------|
| Request OTP | `/api/auth/otp/request/` | POST | No | ✅ |
| Verify OTP | `/api/auth/otp/verify/` | POST | No | ✅ |
| Update Profile | `/api/auth/profile/` | PATCH | Yes | ✅ |
| List Products | `/api/products/` | GET | No | ✅ |
| Add to Cart | `/api/cart/add/` | POST | Yes | ✅ |
| View Cart | `/api/cart/` | GET | Yes | ✅ |
| Update Cart | `/api/cart/{id}/` | PATCH | Yes | ✅ |
| Checkout | `/api/orders/checkout/` | POST | Yes | ✅ |
| List Orders | `/api/orders/` | GET | Yes | ✅ |
| Order Details | `/api/orders/{id}/` | GET | Yes | ✅ |
| OTP Analytics | `/api/auth/otp/analytics/` | GET | No | ✅ |

---

*Last Updated: December 10, 2025*
*Server: http://127.0.0.1:8000*
