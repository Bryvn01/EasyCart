# Payment Initiation Error - 400 Bad Request

## 🔴 Error
```
POST http://localhost:8000/api/orders/payment/initiate/
[HTTP/1.1 400 Bad Request]
```

## 🔍 Root Cause

The backend `initiate_payment` view expects:
```python
order_id = request.data.get("order_id")
payment_method = request.data.get("payment_method")
phone_number = request.data.get("phone_number")
```

**Possible Issues:**
1. Missing `order_id` in request
2. Invalid `order_id` (order doesn't exist or doesn't belong to user)
3. Missing or invalid `phone_number`
4. Missing `payment_method`

## ✅ Quick Fix

### Backend: Add Better Error Handling

```python
# backend/apps/orders/views.py - initiate_payment function

@api_view(["POST"])
def initiate_payment(request):
    # Validate required fields
    order_id = request.data.get("order_id")
    payment_method = request.data.get("payment_method")
    phone_number = request.data.get("phone_number")

    # Add validation
    if not order_id:
        return Response(
            {"error": "order_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not payment_method:
        return Response(
            {"error": "payment_method is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not phone_number:
        return Response(
            {"error": "phone_number is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate phone number format
    if not re.match(r"^\+?[1-9]\d{8,14}$", phone_number):
        return Response(
            {"error": "Invalid phone number format"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if order exists and belongs to user
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response(
            {"error": "Order not found or access denied"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Rest of the payment logic...
```

### Frontend: Ensure Correct Data is Sent

Check `PaymentModal` component to ensure it's sending:
```javascript
{
  order_id: order.id,
  payment_method: paymentMethod,
  phone_number: phoneNumber
}
```

## 🔧 Debugging Steps

### 1. Check Backend Logs
```bash
# In backend terminal, look for error details
python manage.py runserver
```

### 2. Check Request Payload
```javascript
// In browser console (Network tab)
// Look at the request payload for /api/orders/payment/initiate/
```

### 3. Test API Directly
```bash
curl -X POST http://localhost:8000/api/orders/payment/initiate/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 1,
    "payment_method": "mpesa",
    "phone_number": "254712345678"
  }'
```

## 🎯 Most Likely Issue

**The `order_id` is probably missing or invalid.**

Check `PaymentModal` component - it should receive `order` prop from Cart.js and use `order.id` when calling the payment API.

## 📝 Temporary Workaround

If payment is failing, users can:
1. Use "Cash on Delivery" option (doesn't require payment initiation)
2. Use "Bank Transfer" option
3. Contact support with order number

## 🚀 Permanent Solution

1. Add detailed error messages in backend
2. Add frontend validation before API call
3. Add loading states and error displays
4. Log payment attempts for debugging
