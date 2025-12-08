# Twilio Setup Guide

## Current Issue
❌ **HTTP 401 Authentication Error** - Your Twilio credentials are invalid or expired.

## Fix Steps

### 1. Get New Twilio Credentials
1. Go to https://console.twilio.com/
2. Login to your account
3. Navigate to **Account Info** section
4. Copy your:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click "View" to reveal)

### 2. Update .env File
Replace these values in `backend/.env`:
```env
TWILIO_ACCOUNT_SID=your_new_account_sid
TWILIO_AUTH_TOKEN=your_new_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 3. Verify Phone Number
- For **Trial accounts**: You can only send to verified numbers
- Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
- Add your test phone number

### 4. Test Configuration
```bash
cd backend
python test_twilio.py
```

## Alternative: Use Console Logging (Development)

If you don't need real SMS/WhatsApp in development, update `otp_service.py`:

```python
def send_otp_sms(phone_number, otp_code):
    if not twilio_client:
        # Development fallback - log to console
        logger.info(f"[DEV] SMS to {phone_number}: OTP={otp_code}")
        print(f"\n📱 SMS OTP: {otp_code} (to {phone_number})\n")
        return True
    # ... rest of code
```

## Check Current Status
```bash
cd backend
python -c "from decouple import config; print('SID:', config('TWILIO_ACCOUNT_SID')[:10]+'...'); print('Token:', config('TWILIO_AUTH_TOKEN')[:10]+'...')"
```
