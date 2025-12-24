# Payment Gateway Integration Guide

## Overview

EasyCart supports multiple payment gateways to enable secure transactions for merchants and customers across different regions and preferences. This guide covers the setup and configuration of all supported payment methods.

## Supported Payment Gateways

### 1. M-Pesa (Safaricom - Kenya) 🇰🇪
**Best for:** East African mobile money payments

**Features:**
- STK Push (instant payment prompts)
- Real-time payment callbacks
- Automatic order confirmation

**Setup:**
1. Register for M-Pesa API access at [Safaricom Daraja](https://developer.safaricom.co.ke/)
2. Create an app and get your Consumer Key and Consumer Secret
3. Configure environment variables:
```bash
MPESA_CONSUMER_KEY=<your_mpesa_consumer_key>
MPESA_CONSUMER_SECRET=<your_mpesa_consumer_secret>
MPESA_SHORTCODE=174379
MPESA_PASSKEY=<your_mpesa_passkey>
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback/
```

**Testing:**
- Use sandbox credentials for development
- Test phone number: 254708374149
- Test amount: Any amount between 1-70000

---

### 2. Flutterwave (Card Payments) 💳
**Best for:** African card payments and mobile money

**Features:**
- Credit/Debit card processing
- Multiple African currencies
- Hosted checkout pages

**Setup:**
1. Sign up at [Flutterwave](https://flutterwave.com/)
2. Get your API keys from the dashboard
3. Configure environment variables:
```bash
FLUTTERWAVE_API_KEY=your_secret_key
```

**Testing:**
- Use test cards provided in Flutterwave documentation
- Test card: 5531886652142950 (CVV: 564, Expiry: 09/32)

---

### 3. Stripe 💳
**Best for:** International card payments

**Features:**
- Global card acceptance
- Strong fraud detection
- Checkout Sessions for secure payment pages
- Support for 135+ currencies

**Setup:**
1. Create account at [Stripe](https://stripe.com/)
2. Get API keys from Dashboard → Developers → API keys
3. Configure environment variables:
```bash
STRIPE_SECRET_KEY=<your_django_secret_key>
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

**Testing:**
- Test card: 4242 4242 4242 4242 (any future expiry, any CVV)
- 3D Secure card: 4000 0027 6000 3184
- Declined card: 4000 0000 0000 0002

---

### 4. PayPal 💰
**Best for:** International payments with PayPal accounts

**Features:**
- PayPal account payments
- Credit/Debit card support
- Buyer protection
- Multi-currency support

**Setup:**
1. Create account at [PayPal Developer](https://developer.paypal.com/)
2. Create an app in the Developer Dashboard
3. Get Client ID and Secret
4. Configure environment variables:
```bash
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox  # Use 'live' for production
```

**Testing:**
- Use PayPal sandbox accounts
- Create test accounts in PayPal Developer Dashboard
- Currency: PayPal uses USD (automatic conversion from KES)

---

## Payment Flow

### 1. Checkout Process
```
Customer adds items to cart
    ↓
Fills shipping info and selects payment method
    ↓
Clicks checkout (creates order)
    ↓
Payment modal opens
    ↓
Customer initiates payment
    ↓
Redirected to payment gateway
    ↓
Completes payment
    ↓
Callback updates order status
    ↓
Customer sees confirmation
```

### 2. Backend Implementation

The payment service architecture uses a modular approach:

```python
# payment_service.py
class MpesaPaymentService:
    def initiate_stk_push(self, phone, amount, order_id)

class CardPaymentService:
    def initiate_payment(self, amount, email, phone, order_id)

class StripePaymentService:
    def initiate_payment(self, amount, email, phone, order_id)

class PayPalPaymentService:
    def initiate_payment(self, amount, email, phone, order_id)
```

### 3. Frontend Integration

Payment methods are selected during checkout:

```javascript
// Cart.js
<select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
  <option value="mpesa">M-Pesa</option>
  <option value="stripe">Stripe</option>
  <option value="paypal">PayPal</option>
  <option value="card">Flutterwave</option>
  <option value="cash">Cash on Delivery</option>
</select>
```

---

## Order and Payment Status

### Order Status
- `pending` - Order created, awaiting payment
- `processing` - Payment confirmed, order being prepared
- `shipped` - Order dispatched
- `delivered` - Order received by customer
- `cancelled` - Order cancelled

### Payment Status
- `pending` - Payment not initiated
- `processing` - Payment in progress
- `completed` - Payment successful
- `failed` - Payment failed
- `cancelled` - Payment cancelled by user

---

## Admin Dashboard

Administrators can view detailed payment analytics:

### Payment Metrics
- Total revenue by payment method
- Payment success/failure rates
- Pending payments requiring attention
- Payment method popularity

### Recent Orders View
- Order ID and customer email
- Payment method used
- Payment status
- Order status
- Transaction reference

---

## Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Use HTTPS** - All payment callbacks must use secure connections
3. **Validate callbacks** - Verify webhook signatures
4. **Sanitize inputs** - Prevent injection attacks
5. **Log transactions** - Keep audit trails for troubleshooting

---

## Error Handling

### Common Errors and Solutions

**M-Pesa Errors:**
```
Error: "Failed to get access token"
Solution: Check MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET

Error: "Request cancelled by user"
Solution: User cancelled STK prompt - normal behavior

Error: "Insufficient funds"
Solution: Customer needs to top up M-Pesa account
```

**Stripe Errors:**
```
Error: "Stripe not configured"
Solution: Set STRIPE_SECRET_KEY in environment

Error: "Card declined"
Solution: Customer should try different payment method
```

**PayPal Errors:**
```
Error: "PayPal authentication failed"
Solution: Verify PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET

Error: "Currency not supported"
Solution: PayPal requires currency conversion (handled automatically)
```

---

## Testing Checklist

- [ ] M-Pesa STK push receives on test phone
- [ ] Flutterwave card payment completes
- [ ] Stripe checkout redirects correctly
- [ ] PayPal payment flow works end-to-end
- [ ] Order status updates after payment
- [ ] Admin sees payment in dashboard
- [ ] Failed payments are handled gracefully
- [ ] Customer receives order confirmation

---

## Migration Database

After adding Stripe and PayPal support, create and run migrations:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

---

## Production Deployment

### Before Going Live:

1. **Switch to production credentials:**
   - M-Pesa: Use production base URL
   - Stripe: Replace `sk_test_` with `sk_live_`
   - PayPal: Set `PAYPAL_MODE=live`
   - Flutterwave: Use live secret key

2. **Update callback URLs:**
   - Set MPESA_CALLBACK_URL to production domain
   - Update FRONTEND_URL in all payment services

3. **Test thoroughly:**
   - Run small test transactions
   - Verify callbacks work
   - Check admin dashboard shows data correctly

4. **Monitor:**
   - Set up logging for payment failures
   - Monitor transaction success rates
   - Track revenue in admin dashboard

---

## Support and Troubleshooting

For issues:
1. Check Django logs: `python manage.py runserver` output
2. Review payment gateway dashboards
3. Verify environment variables are set
4. Test with sandbox credentials first
5. Check callback URLs are accessible

---

## Additional Resources

- [M-Pesa API Documentation](https://developer.safaricom.co.ke/docs)
- [Flutterwave Documentation](https://developer.flutterwave.com/)
- [Stripe API Reference](https://stripe.com/docs/api)
- [PayPal Developer Docs](https://developer.paypal.com/docs/api/overview/)
