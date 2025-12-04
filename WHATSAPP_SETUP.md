# WhatsApp OTP Setup Guide

## Overview
WhatsApp OTP is now enabled in EasyCart. You can send OTP codes via WhatsApp using Twilio's WhatsApp API.

## Setup Options

### Option 1: Twilio Sandbox (Testing - FREE)
Perfect for development and testing. No approval needed.

**Steps:**

1. **Join Twilio WhatsApp Sandbox**
   - Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
   - Send the join code from your WhatsApp to the sandbox number
   - Example: Send `join <your-code>` to `+1 415 523 8886`

2. **Configure Environment Variables**

   Your `.env` should have:
   ```env
   TWILIO_ACCOUNT_SID=<your_twilio_account_sid>
   TWILIO_AUTH_TOKEN=<your_twilio_auth_token>
   TWILIO_PHONE_NUMBER=your_phone_number_here
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```

3. **Update Backend Code**

   Edit `backend/apps/accounts/otp_service.py`:
   ```python
   # Change line 73 from:
   from_=f'whatsapp:{TWILIO_PHONE_NUMBER}',

   # To:
   from_=config('TWILIO_WHATSAPP_FROM', default='whatsapp:+14155238886'),
   ```

4. **Test WhatsApp OTP**
   - Restart backend: `python manage.py runserver`
   - Go to: http://localhost:3000/login/otp
   - Enter your phone number (must be joined to sandbox)
   - Select "WhatsApp" as delivery method
   - Click "Send OTP"

### Option 2: Production WhatsApp Business API
For production use with any phone number.

**Requirements:**
- Facebook Business Manager account
- WhatsApp Business API approval (takes 1-3 days)
- Message templates approval

**Steps:**

1. **Apply for WhatsApp Business API**
   - Go to: https://console.twilio.com/us1/develop/sms/whatsapp/senders
   - Click "Request Access"
   - Fill in business details
   - Wait for approval (1-3 days)

2. **Create Message Templates**
   - Templates must be pre-approved by WhatsApp
   - Example template:
     ```
     Your EasyCart verification code is: {{1}}
     Valid for 10 minutes.
     ```

3. **Update Configuration**
   - After approval, get your WhatsApp sender number
   - Update `TWILIO_WHATSAPP_FROM` in `.env`

## Testing

### Test with Sandbox

1. **Join Sandbox** (one-time setup)
   ```
   Send to: +1 415 523 8886
   Message: join <your-sandbox-code>
   ```

2. **Test OTP Flow**
   ```bash
   # Start backend
   cd backend
   python manage.py runserver

   # Start frontend
   cd frontend
   npm start
   ```

3. **Login with WhatsApp OTP**
   - Go to: http://localhost:3000/login/otp
   - Enter phone: +254723796116 (or your number)
   - Select: WhatsApp
   - Check WhatsApp for OTP code
   - Enter code and verify

### Test with cURL

```bash
# Request OTP
curl -X POST http://localhost:8000/api/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+254723796116",
    "method": "whatsapp"
  }'

# Verify OTP
curl -X POST http://localhost:8000/api/auth/otp/verify/ \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+254723796116",
    "otp_code": "123456"
  }'
```

## Phone Number Format

Supported formats (all converted to +254XXXXXXXXX):
- `+254723796116` ✅
- `254723796116` ✅
- `0723796116` ✅
- `723796116` ✅

## Troubleshooting

### "WhatsApp send failed"

**Cause**: Not joined to Twilio sandbox

**Solution**:
1. Send join message to sandbox number
2. Wait for confirmation
3. Try again

### "Failed to send OTP via whatsapp"

**Cause**: Twilio credentials invalid or sandbox not configured

**Solution**:
1. Verify credentials in `.env`
2. Check Twilio console for errors
3. System will auto-fallback to email

### "Number not verified"

**Cause**: Using trial account with unverified number

**Solution**:
1. Verify number in Twilio console
2. Or upgrade to paid account
3. Or use sandbox for testing

## Features

✅ **Automatic Fallback**: If WhatsApp fails, system sends OTP via email
✅ **Phone Normalization**: Accepts multiple phone formats
✅ **10-Minute Expiry**: OTP codes expire after 10 minutes
✅ **Auto-Registration**: New users created automatically
✅ **Sandbox Support**: Free testing with Twilio sandbox

## Cost

- **Sandbox**: FREE (unlimited messages to joined numbers)
- **Production**: ~$0.005 per message (Twilio pricing)

## Security

- OTP codes are 6 digits (100,000 - 999,999)
- Codes expire after 10 minutes
- One-time use only
- Stored hashed in database

## Next Steps

1. Join Twilio WhatsApp sandbox
2. Update `TWILIO_WHATSAPP_FROM` in backend code
3. Restart backend server
4. Test WhatsApp OTP login

## Support

- Twilio Docs: https://www.twilio.com/docs/whatsapp
- Sandbox Guide: https://www.twilio.com/docs/whatsapp/sandbox
- EasyCart Issues: Open GitHub issue
