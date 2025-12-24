# Quick Test Guide - OTP Authentication

## ✅ What's Working

1. **OTP Request** - Generates 6-digit code
2. **Email Delivery** - Sends OTP via email (no setup needed)
3. **SMS/WhatsApp** - Ready (needs Africa's Talking API key)
4. **Auto-Registration** - New users created automatically
5. **JWT Tokens** - Returns access/refresh tokens on verification

## 🚀 Test Now (5 Minutes)

### Step 1: Start Servers

```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 2: Test OTP Login

1. Go to: **http://localhost:3000/login/otp**
2. Enter your email: `yourname@gmail.com`
3. Select method: **Email**
4. Click **"Send OTP"**
5. Check your email inbox (or spam folder)
6. Enter the 6-digit code
7. Click **"Verify & Login"**
8. ✅ You're logged in!

### Step 3: Verify Login

- You should be redirected to homepage
- Check browser console: JWT tokens stored
- Cart should now work (no more 500 error)

## 📧 Email Setup (If Not Working)

### Gmail Setup

1. **Enable 2-Step Verification**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other"
   - Copy the 16-character password

3. **Update backend/.env**
   ```env
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_16_char_app_password
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   DEFAULT_FROM_EMAIL=noreply@easycart.com
   ```

4. **Restart backend**
   ```bash
   cd backend
   python manage.py runserver
   ```

## 📱 SMS Setup (Optional - For Kenya)

### Africa's Talking

1. **Sign Up**
   - Go to: https://africastalking.com
   - Create free sandbox account

2. **Get API Key**
   - Dashboard → Settings → API Key
   - Copy your API key

3. **Update backend/.env**
   ```env
   AFRICASTALKING_USERNAME=sandbox
   AFRICASTALKING_API_KEY=your_api_key_here
   ```

4. **Test with Phone**
   - Use format: `0712345678` or `+254712345678`
   - Sandbox mode: Check dashboard for virtual messages
   - Production: Add credits for real SMS

## 🧪 Test with cURL

### Request OTP
```bash
curl -X POST http://localhost:8000/api/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{"identifier": "test@example.com", "method": "email"}'
```

**Response:**
```json
{
  "message": "OTP sent via email",
  "identifier": "test@example.com",
  "is_new_user": true,
  "expires_in": 600
}
```

### Verify OTP
```bash
curl -X POST http://localhost:8000/api/auth/otp/verify/ \
  -H "Content-Type: application/json" \
  -d '{"identifier": "test@example.com", "otp_code": "123456"}'
```

**Response:**
```json
{
  "message": "Login successful",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "phone_number": null,
    "first_name": "",
    "last_name": ""
  }
}
```

## 🐛 Troubleshooting

### "Failed to send OTP via email"

**Check:**
1. Email credentials in `.env`
2. Gmail app password (not regular password)
3. 2-Step Verification enabled
4. Check spam folder

**Test Email:**
```bash
cd backend
python manage.py shell
```
```python
from apps.accounts.otp_service import send_otp_email
result = send_otp_email("your@email.com", "123456")
print(result)  # Should be True
```

### "OTP expired"

- OTP valid for 10 minutes only
- Click "Resend OTP" to get new code

### "Invalid OTP code"

- Check code carefully (6 digits)
- Use latest OTP (old codes invalidated)
- Request new OTP if unsure

### Cart 500 Error Fixed

- Was caused by unauthenticated users
- Now returns empty cart for anonymous users
- Works normally after OTP login

## 📊 What Happens Behind the Scenes

1. **Request OTP**
   - Generates random 6-digit code
   - Stores in database with timestamp
   - Sends via email/SMS/WhatsApp
   - Expires in 10 minutes

2. **Verify OTP**
   - Checks code matches
   - Checks not expired
   - Marks as verified
   - Generates JWT tokens
   - Clears OTP data

3. **Auto-Registration**
   - New users created on first OTP request
   - Email users: `email@domain.com`
   - Phone users: `+254712345678`
   - No password required

## 🔒 Security Features

- ✅ 10-minute expiry
- ✅ One-time use
- ✅ JWT authentication
- ✅ Phone normalization
- ✅ Input validation
- ✅ Rate limiting ready (configure in settings)

## 📈 Next Steps

1. **Test OTP login** ✅
2. **Configure email** (if needed)
3. **Setup Africa's Talking** (for SMS)
4. **Test with real users**
5. **Deploy to production**

## 📞 Support

- **Full Documentation**: `OTP_AUTHENTICATION.md`
- **Backend Code**: `backend/apps/accounts/otp_*`
- **Frontend Code**: `frontend/src/pages/OTPLogin.js`

---

**Status**: ✅ Ready to test with email. SMS requires Africa's Talking setup.

**Time to Test**: 5 minutes
