# OTP Delivery Configuration Guide

Complete guide for setting up WhatsApp, SMS, and Email delivery for OTP authentication in EasyCart.

## 📋 Table of Contents

- [Overview](#overview)
- [Delivery Methods](#delivery-methods)
- [Twilio Setup (WhatsApp/SMS)](#twilio-setup-whatsappsms)
- [Email SMTP Setup](#email-smtp-setup)
- [Configuration](#configuration)
- [Testing](#testing)
- [Analytics & Monitoring](#analytics--monitoring)
- [Troubleshooting](#troubleshooting)

---

## Overview

EasyCart supports multiple OTP delivery methods with automatic fallback:

1. **WhatsApp** (Primary - best user experience)
2. **SMS** (Alternative - reliable worldwide)
3. **Email** (Fallback - works for email logins)
4. **Console Logging** (Final fallback - always works)

### Delivery Flow

```
WhatsApp → SMS → Email → Console Logging
   ↓         ↓      ↓           ↓
 FAIL     FAIL   FAIL       ALWAYS WORKS
```

**Current Status**: ✅ Console logging active (100% success rate)

---

## Delivery Methods

### 1. WhatsApp (Recommended)

**Advantages**:
- ✅ Instant delivery
- ✅ High open rates (98%+)
- ✅ Better user experience
- ✅ Works globally
- ✅ Rich formatting support

**Limitations**:
- ⚠️ Requires Twilio account
- ⚠️ WhatsApp Business approval needed
- 💰 ~$0.005 per message

**Best for**: Kenyan market (high WhatsApp usage)

### 2. SMS

**Advantages**:
- ✅ Universal (works on all phones)
- ✅ Reliable delivery
- ✅ No app required
- ✅ Works offline (received when online)

**Limitations**:
- ⚠️ Requires Twilio account
- 💰 ~$0.01-0.05 per message (varies by country)
- ⚠️ Can be filtered as spam

**Best for**: Users without WhatsApp

### 3. Email

**Advantages**:
- ✅ Free (using Gmail/SendGrid)
- ✅ No per-message cost
- ✅ Works for email-based logins
- ✅ Easy to set up

**Limitations**:
- ⚠️ May go to spam folder
- ⚠️ Slower delivery
- ⚠️ Lower open rates (~20%)
- ⚠️ Requires email provider

**Best for**: Email-based authentication

### 4. Console Logging (Current)

**Advantages**:
- ✅ Always works
- ✅ No configuration needed
- ✅ 100% success rate
- ✅ No cost

**Limitations**:
- ❌ Admin must check server logs
- ❌ Not scalable for production
- ❌ Poor user experience

**Best for**: Development and MVP testing

---

## Twilio Setup (WhatsApp/SMS)

### Step 1: Create Twilio Account

1. Go to [Twilio Console](https://www.twilio.com/console)
2. Sign up for free trial (gets $15 credit)
3. Verify your email and phone number

### Step 2: Get API Credentials

1. From Twilio Console dashboard:
   - Copy **Account SID** (starts with `AC...`)
   - Copy **Auth Token** (click "show" to reveal)

2. Add to `.env`:
```bash
TWILIO_ACCOUNT_SID=<your_twilio_account_sid>
TWILIO_AUTH_TOKEN=<your_twilio_auth_token>
```

### Step 3: Set Up Phone Number (SMS)

1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Select Kenya (+254) or your region
3. Choose a number with **SMS capabilities**
4. Complete purchase

5. Add to `.env`:
```bash
TWILIO_PHONE_NUMBER=+254712345678
```

**Trial Limitations**:
- Only verified numbers can receive SMS
- Messages include "Sent from Twilio trial account"
- **Solution**: Upgrade to paid account (~$20/month + usage)

### Step 4: Set Up WhatsApp (Recommended)

#### Option A: WhatsApp Sandbox (Testing)

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Join sandbox by sending code to Twilio WhatsApp number
3. Add sandbox number to `.env`:

```bash
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Limitations**:
- Only works with joined users
- 24-hour session window
- Testing only

#### Option B: WhatsApp Business API (Production)

1. Submit WhatsApp Business Profile:
   - Go to **Messaging** → **Settings** → **WhatsApp sender**
   - Fill business details
   - Submit for approval (1-3 days)

2. Once approved, get your WhatsApp number:
```bash
TWILIO_WHATSAPP_NUMBER=whatsapp:+254712345678
```

**Requirements**:
- Valid business
- Facebook Business Manager account
- Approval from WhatsApp (usually automatic)

### Step 5: Verify Setup

Test with Python:

```python
from twilio.rest import Client

account_sid = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
auth_token = 'your_auth_token'
client = Client(account_sid, auth_token)

# Test SMS
message = client.messages.create(
    body="Test OTP: 123456",
    from_='+254712345678',
    to='+254723796116'
)
print(f"SMS SID: {message.sid}")

# Test WhatsApp
message = client.messages.create(
    body="Test OTP: 123456",
    from_='whatsapp:+14155238886',
    to='whatsapp:+254723796116'
)
print(f"WhatsApp SID: {message.sid}")
```

---

## Email SMTP Setup

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Step Verification**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Create App Password**:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer"
   - Copy generated password (16 characters)

3. **Add to `.env`**:
```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your.email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password_here
DEFAULT_FROM_EMAIL=EasyCart <noreply@easycart.com>
```

**Gmail Limits**:
- Free: 500 emails/day
- Google Workspace: 2,000 emails/day

### Option 2: SendGrid (Recommended for Production)

1. **Sign Up**:
   - Go to [SendGrid](https://sendgrid.com)
   - Free tier: 100 emails/day

2. **Create API Key**:
   - Go to **Settings** → **API Keys** → **Create API Key**
   - Name: "EasyCart OTP"
   - Permissions: Full Access (or Mail Send only)
   - Copy key (starts with `SG.`)

3. **Verify Sender Identity**:
   - Go to **Settings** → **Sender Authentication**
   - Add email address or domain
   - Verify via email

4. **Add to `.env`**:
```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.your_sendgrid_api_key_here
DEFAULT_FROM_EMAIL=EasyCart <noreply@yourdomain.com>
```

### Option 3: Mailgun

1. Sign up at [Mailgun](https://www.mailgun.com)
2. Verify domain or use sandbox domain
3. Get SMTP credentials

```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=postmaster@yourdomain.mailgun.org
EMAIL_HOST_PASSWORD=your_mailgun_password
```

**Mailgun Limits**:
- Free: 5,000 emails/month for 3 months

---

## Configuration

### Environment Variables

Complete `.env` configuration:

```bash
# ========================================
# OTP DELIVERY CONFIGURATION
# ========================================

# Twilio (WhatsApp + SMS)
TWILIO_ACCOUNT_SID=<your_twilio_account_sid>
TWILIO_AUTH_TOKEN=<your_twilio_auth_token>
TWILIO_PHONE_NUMBER=+254712345678
TWILIO_WHATSAPP_NUMBER=whatsapp:+254712345678

# Email SMTP
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your.email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password_here
DEFAULT_FROM_EMAIL=EasyCart <noreply@easycart.com>
```

### Render Deployment

1. Go to your Render dashboard
2. Select **easycart-backend** service
3. Go to **Environment** tab
4. Add each variable above

**Important**: Click **Save Changes** to trigger redeployment

### Verification

After configuring, check logs:

```bash
# Should see this instead of "twilio package not installed"
INFO CSRF disabled for /api/auth/otp/request/
INFO OTP sent to user 7 via whatsapp from IP 41.90.172.98
```

---

## Testing

### 1. Test OTP Request

```bash
# Using curl
curl -X POST https://easycart-backend-2k8l.onrender.com/api/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+254723796116",
    "method": "whatsapp"
  }'

# Expected response
{
  "message": "OTP sent via whatsapp",
  "identifier": "+254723796116",
  "is_new_user": false,
  "expires_in": 600,
  "can_resend_after": 60
}
```

### 2. Check Delivery Logs

View production logs:

```bash
# In Render dashboard → Logs tab
# Look for:
INFO OTP sent to user 7 via whatsapp from IP 41.90.172.98
# or
📱 [CONSOLE] OTP for +254723796116: 357707
```

### 3. Verify OTP

```bash
curl -X POST https://easycart-backend-2k8l.onrender.com/api/auth/otp/verify/ \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+254723796116",
    "otp_code": "357707"
  }'
```

---

## Analytics & Monitoring

### View Delivery Analytics

Access the analytics endpoint to monitor OTP delivery patterns:

```bash
# Basic analytics (last 7 days)
GET /api/auth/otp/analytics/

# Custom period
GET /api/auth/otp/analytics/?days=30

# Detailed with daily breakdown
GET /api/auth/otp/analytics/?days=14&detailed=true
```

### Sample Response

```json
{
  "period": {
    "start": "2025-12-03T00:00:00Z",
    "end": "2025-12-10T14:00:00Z",
    "days": 7
  },
  "overview": {
    "total_deliveries": 45,
    "successful": 43,
    "failed": 2,
    "success_rate": 95.56
  },
  "by_method": [
    {
      "method": "whatsapp",
      "total": 25,
      "successful": 24,
      "failed": 1,
      "success_rate": 96.0
    },
    {
      "method": "email",
      "total": 12,
      "successful": 12,
      "failed": 0,
      "success_rate": 100.0
    },
    {
      "method": "console",
      "total": 8,
      "successful": 7,
      "failed": 1,
      "success_rate": 87.5
    }
  ],
  "recommendations": [
    {
      "type": "info",
      "message": "Email has the highest success rate (100%). Consider prioritizing this method."
    }
  ]
}
```

### Interpretation

- **High console usage** (>50%): Configure external services
- **High failure rate** (>20%): Check credentials and service status
- **Best method**: Use analytics to optimize default delivery method

### Django Admin

View detailed logs:

1. Go to https://easycart-backend-2k8l.onrender.com/admin/
2. Login with superadmin credentials
3. Navigate to **Accounts** → **OTP Delivery Logs**

Filters available:
- Delivery method
- Success/failure
- Date range
- User
- IP address

---

## Troubleshooting

### WhatsApp Issues

**Error**: "WhatsApp service not configured"

**Solutions**:
1. Verify `TWILIO_WHATSAPP_NUMBER` is set
2. Check number format: `whatsapp:+254712345678`
3. Ensure WhatsApp is enabled on Twilio number
4. For sandbox, verify user joined sandbox

---

**Error**: "Unable to create record: Permission to send an SMS has not been enabled"

**Solution**: Upgrade from trial account or verify recipient number

---

### SMS Issues

**Error**: "SMS delivery failed"

**Solutions**:
1. Verify phone number format: `+254712345678`
2. Check Twilio balance (trial credit or paid)
3. Ensure number has SMS capability
4. Check recipient is verified (for trial)

---

### Email Issues

**Error**: "SMTP Authentication Error"

**Solutions**:
1. **Gmail**: Use App Password, not account password
2. **SendGrid**: Ensure API key starts with `SG.`
3. Verify `EMAIL_HOST_USER` matches sender email
4. Check firewall allows port 587

---

**Error**: Emails go to spam

**Solutions**:
1. Set up SPF/DKIM records (domain verification)
2. Use verified sender domain
3. Avoid spammy content
4. Use reputable SMTP provider (SendGrid, Mailgun)

---

### Console Logging Issues

**Error**: "Can't find OTP in logs"

**Solutions**:
1. Check Render logs (not local console)
2. Look for: `📱 [CONSOLE] OTP for`
3. Logs may be delayed 10-30 seconds
4. Ensure you're checking correct time range

---

### Rate Limiting

**Error**: "Please wait X seconds before requesting another OTP"

**Explanation**: Built-in protection (60-second cooldown)

**Solutions**:
- Wait for cooldown period
- For testing: Temporarily reduce `COOLDOWN_SECONDS` in `otp_views.py`
- Production: Keep cooldown for security

---

**Error**: HTTP 429 - "Too many requests"

**Explanation**: IP-based rate limiting (5 requests/hour)

**Solutions**:
- Wait for rate limit reset
- For testing: Temporarily increase throttle rates
- Production: Keep limits for security

---

## Cost Estimates

### Development/MVP (0-1000 users)

| Method | Cost | Notes |
|--------|------|-------|
| Console Logging | **FREE** | Current setup |
| Gmail SMTP | **FREE** | 500 emails/day limit |
| Twilio Trial | **FREE** | $15 credit, limited features |

**Recommended**: Console + Gmail SMTP = $0/month

---

### Small Scale (1K-10K users, ~100 OTPs/day)

| Method | Monthly Cost | Notes |
|--------|-------------|-------|
| WhatsApp | ~$15 | $0.005 × 3,000 messages |
| SMS | ~$30-150 | $0.01-0.05 × 3,000 messages |
| SendGrid | **FREE** | Up to 100/day (3,000/month) |

**Recommended**: WhatsApp + SendGrid = $15/month

---

### Medium Scale (10K-100K users, ~500 OTPs/day)

| Method | Monthly Cost | Notes |
|--------|-------------|-------|
| WhatsApp | ~$75 | $0.005 × 15,000 messages |
| SMS | ~$150-750 | Country dependent |
| SendGrid Essentials | ~$20 | 50,000 emails/month |

**Recommended**: WhatsApp + SendGrid = $95/month

---

### Large Scale (100K+ users, ~2000 OTPs/day)

| Method | Monthly Cost | Notes |
|--------|-------------|-------|
| WhatsApp | ~$300 | $0.005 × 60,000 messages |
| SMS | ~$600-3,000 | Country dependent |
| SendGrid Pro | ~$90 | 1.5M emails/month |

**Recommended**: WhatsApp primary, SMS backup = $300-900/month

---

## Next Steps

1. **Immediate** (Keep current setup):
   - ✅ Console logging works
   - ✅ No configuration needed
   - ✅ 100% success rate

2. **Short-term** (Better UX):
   - 🔲 Set up Gmail SMTP (free, 15 minutes)
   - 🔲 Monitor analytics for usage patterns
   - 🔲 Test email delivery

3. **Medium-term** (Scale to 100+ users):
   - 🔲 Create Twilio trial account
   - 🔲 Join WhatsApp sandbox
   - 🔲 Test WhatsApp delivery
   - 🔲 Compare user preference (analytics)

4. **Production** (Launch):
   - 🔲 Upgrade Twilio to paid
   - 🔲 Get WhatsApp Business approval
   - 🔲 Switch to SendGrid (if needed)
   - 🔲 Set up domain verification (SPF/DKIM)
   - 🔲 Monitor delivery rates weekly

---

## Support Resources

- **Twilio Docs**: https://www.twilio.com/docs/sms
- **WhatsApp API**: https://www.twilio.com/docs/whatsapp
- **SendGrid Docs**: https://docs.sendgrid.com
- **EasyCart Issues**: https://github.com/Bryvn01/EasyCart/issues

---

## Summary

✅ **Current Status**: OTP system fully functional with console logging

📊 **Analytics**: View delivery metrics at `/api/auth/otp/analytics/`

💰 **Cost**: Currently $0/month (console logging)

🚀 **Next Step**: Configure Gmail SMTP for better UX (free, 15 minutes)

📈 **Production**: Add Twilio WhatsApp for scale ($15-300/month based on usage)

---

*Last Updated: December 10, 2025*
*Version: 1.0*
