# M-Pesa Integration Setup Guide

## Current Issue
❌ **M-Pesa authentication failing with 400 Bad Request**

Your M-Pesa credentials are invalid or expired.

## Fix Steps

### 1. Get New M-Pesa Credentials

**For Sandbox (Testing):**
1. Go to: https://developer.safaricom.co.ke/
2. Login or create account
3. Navigate to **My Apps** → Create new app
4. Select **Lipa Na M-Pesa Online** API
5. Copy credentials:
   - Consumer Key
   - Consumer Secret
   - Passkey (from test credentials)

**For Production:**
1. Contact Safaricom Business Support
2. Apply for M-Pesa Paybill/Till Number
3. Request API credentials
4. Complete KYC verification

### 2. Update Environment Variables

Edit `backend/.env`:
```env
# M-Pesa Sandbox (Testing)
MPESA_CONSUMER_KEY=<your_mpesa_consumer_key>
MPESA_CONSUMER_SECRET=<your_mpesa_consumer_secret>
MPESA_SHORTCODE=174379
MPESA_PASSKEY=<your_mpesa_passkey>
MPESA_CALLBACK_URL=https://easycart-backend-2k8l.onrender.com/api/orders/mpesa/callback/

# For Production, use:
# MPESA_SHORTCODE=your_paybill_number
# And production credentials
```

### 3. Test Credentials

```bash
cd backend
python -c "
from apps.orders.payment_service import MpesaPaymentService
mpesa = MpesaPaymentService()
token = mpesa.get_access_token()
print('✅ M-Pesa configured' if token else '❌ Invalid credentials')
"
```

### 4. Alternative Payment Methods

If M-Pesa is not available, users can still use:
- ✅ Cash on Delivery
- ✅ Bank Transfer
- ✅ Airtel Money
- ✅ Card Payment (Flutterwave)
- ✅ PayPal

## Temporary Workaround

To allow orders without M-Pesa, the system now:
1. Shows user-friendly error message
2. Suggests alternative payment methods
3. Allows Cash on Delivery as fallback

## Production Checklist

- [ ] Valid M-Pesa credentials obtained
- [ ] Credentials added to Render environment variables
- [ ] Callback URL whitelisted in M-Pesa portal
- [ ] Test transaction completed successfully
- [ ] Production shortcode configured
- [ ] SSL certificate valid (required for callbacks)

## Support

- **Safaricom Developer Portal**: https://developer.safaricom.co.ke/
- **Support Email**: apisupport@safaricom.co.ke
- **Documentation**: https://developer.safaricom.co.ke/Documentation
