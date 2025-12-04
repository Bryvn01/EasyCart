# M-Pesa Payment Setup Guide

## Current Issue
Payment initiation is failing because M-Pesa credentials are not configured in your environment.

## Quick Fix for Development

Add these to your `backend/.env` file:

```env
# M-Pesa Sandbox Credentials (for testing)
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=http://localhost:8000/api/orders/mpesa/callback/
```

## Getting M-Pesa Sandbox Credentials

1. **Register on Safaricom Daraja**
   - Visit: https://developer.safaricom.co.ke/
   - Create an account
   - Login to your account

2. **Create a Sandbox App**
   - Go to "My Apps" → "Create New App"
   - Select "Lipa Na M-Pesa Sandbox"
   - Fill in app details
   - Submit

3. **Get Credentials**
   - Consumer Key: Found in your app details
   - Consumer Secret: Found in your app details
   - Shortcode: Use `174379` (default sandbox shortcode)
   - Passkey: Found in "Test Credentials" section

4. **Update .env**
   - Copy credentials to `backend/.env`
   - Restart Django server

## Alternative: Use Mock Payment for Development

If you don't want to set up M-Pesa right now, you can:

1. **Use "Cash on Delivery"** payment method instead
2. **Or add a mock payment mode** for development

### Option: Add Mock Payment Mode

Add this to `backend/.env`:
```env
PAYMENT_MOCK_MODE=True
```

Then the system will simulate successful payments without calling M-Pesa API.

## Testing M-Pesa

Once configured, use these test phone numbers in sandbox:
- `254708374149` - Success
- `254708374150` - Insufficient funds
- `254708374151` - Invalid account

## Production Setup

For production:
1. Apply for M-Pesa Go Live
2. Get production credentials
3. Update `.env` with production values
4. Set `DEBUG=False` in Django settings

## Error Messages

- **"M-Pesa service not configured"** → Add credentials to .env
- **"Failed to get access token"** → Check consumer key/secret
- **"Payment request failed"** → Check network/API availability
