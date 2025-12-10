# Fix M-Pesa on Render - Quick Guide

## Problem
M-Pesa works locally but fails on deployed site with 400 error.

## Root Cause
The code was using `DEBUG=False` to switch to production M-Pesa API, but you're using **sandbox credentials**.

## Solution

### Step 1: Add Environment Variable on Render

Go to: https://dashboard.render.com/web/srv-YOUR_SERVICE_ID/env

Add this variable:
```
MPESA_ENVIRONMENT=sandbox
```

### Step 2: Verify Existing Variables

Make sure these are set on Render:
```
MPESA_CONSUMER_KEY=cFvU29oWoSqJkmwZJABPsmz8tFnekbheZErKMvSfAqCkEwV2
MPESA_CONSUMER_SECRET=IQPnB9MTtF85bNZINlqQWcgpDqRr2JGHbpHKOSamrleEPtDQKYbulw6cap7A1fK2
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://easycart-backend-2k8l.onrender.com/api/orders/mpesa/callback/
```

### Step 3: Redeploy

After adding the environment variable, Render will auto-redeploy.

## How It Works Now

- **Local (DEBUG=True)**: Uses sandbox automatically
- **Render (DEBUG=False + MPESA_ENVIRONMENT=sandbox)**: Uses sandbox with your credentials
- **Production (MPESA_ENVIRONMENT=production)**: Uses production API (when you get production credentials)

## Test After Deploy

1. Place an order
2. Select M-Pesa payment
3. Enter phone: 254712345678 (sandbox test number)
4. Should receive STK push

## When Ready for Production

1. Get production credentials from Safaricom
2. Update all MPESA_* variables on Render
3. Change `MPESA_ENVIRONMENT=production`
4. Whitelist callback URL in M-Pesa portal

## Troubleshooting

**Still getting 400?**
- Check credentials are copied correctly (no extra spaces)
- Verify MPESA_ENVIRONMENT is set to "sandbox"
- Check Render logs for detailed error

**STK push not received?**
- Use Safaricom test numbers: 254708374149, 254712345678
- Check phone number format: 254XXXXXXXXX (no +)
- Verify shortcode matches credentials (174379 for sandbox)
