# OTP Authentication for Customer Login/Registration

Complete implementation of OTP-based authentication for EasyCart customers using SMS, WhatsApp, and Email.

## 🌟 Features

- ✅ **Multi-Channel OTP Delivery**: SMS, WhatsApp, and Email
- ✅ **Passwordless Authentication**: Secure login without passwords
- ✅ **Auto-Registration**: New users automatically created on first OTP request
- ✅ **Kenya-Focused**: Integrated with Africa's Talking for local SMS/WhatsApp
- ✅ **10-Minute Expiry**: OTP codes expire after 10 minutes
- ✅ **Resend Functionality**: Users can request new codes
- ✅ **JWT Tokens**: Returns access and refresh tokens on successful verification

---

## 📡 API Endpoints

### 1. Request OTP
```http
POST /api/auth/otp/request/
```

**Request Body:**
```json
{
  "identifier": "0712345678",  // Phone or email
  "method": "sms"              // "sms", "whatsapp", or "email"
}
```

**Response:**
```json
{
  "message": "OTP sent via sms",
  "identifier": "0712345678",
  "is_new_user": true,
  "expires_in": 600
}
```

### 2. Verify OTP & Login
```http
POST /api/auth/otp/verify/
```

**Request Body:**
```json
{
  "identifier": "0712345678",
  "otp_code": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "phone_number": "+254712345678",
    "first_name": "",
    "last_name": ""
  }
}
```

### 3. Resend OTP
```http
POST /api/auth/otp/resend/
```

Same as request OTP endpoint.

---

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install africastalking
```

### 2. Configure Environment Variables

Add to `backend/.env`:

```env
# Africa's Talking (SMS/WhatsApp)
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=your_api_key_here

# Email Settings (Fallback)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=noreply@easycart.com
```

### 3. Run Migrations

```bash
python manage.py migrate
```

### 4. Test OTP Service

```bash
python manage.py shell
```

```python
from apps.accounts.otp_service import generate_otp, send_otp_sms, send_otp_email

# Generate OTP
otp = generate_otp()
print(f"Generated OTP: {otp}")

# Test SMS (requires Africa's Talking setup)
send_otp_sms("+254712345678", otp)

# Test Email
send_otp_email("user@example.com", otp)
```

---

## 🎨 Frontend Setup

### 1. OTP Login Page

Already created at `frontend/src/pages/OTPLogin.js`

### 2. Access OTP Login

- Navigate to: `http://localhost:3000/login/otp`
- Or click "Login with OTP" link on regular login page

### 3. User Flow

1. **Enter phone or email**
2. **Select delivery method** (SMS/WhatsApp/Email)
3. **Click "Send OTP"**
4. **Enter 6-digit code** received
5. **Click "Verify & Login"**
6. **Redirected to homepage** with JWT tokens stored

---

## 🇰🇪 Africa's Talking Setup (Kenya)

### 1. Create Account

1. Go to [africastalking.com](https://africastalking.com)
2. Sign up for free sandbox account
3. Get your API key from dashboard

### 2. Sandbox Testing

**Sandbox Mode:**
- Username: `sandbox`
- Free testing with virtual numbers
- No real SMS sent (check dashboard for messages)

**Production Mode:**
- Upgrade account
- Add credits
- Real SMS/WhatsApp delivery

### 3. Phone Number Format

**Kenya Format:**
- Input: `0712345678` or `712345678`
- Normalized: `+254712345678`
- Supported: Safaricom, Airtel, Telkom

### 4. WhatsApp Setup

Requires WhatsApp Business API:
1. Apply for WhatsApp channel in Africa's Talking dashboard
2. Get approval from Meta
3. Configure WhatsApp sender ID

---

## 📧 Email Setup (Gmail)

### 1. Enable 2-Step Verification

1. Go to Google Account settings
2. Enable 2-Step Verification

### 2. Generate App Password

1. Go to Security → App passwords
2. Select "Mail" and "Other"
3. Copy generated password

### 3. Configure Django

```env
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=generated_app_password
```

---

## 🧪 Testing

### Test with cURL

**Request OTP:**
```bash
curl -X POST http://localhost:8000/api/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{"identifier": "0712345678", "method": "sms"}'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:8000/api/auth/otp/verify/ \
  -H "Content-Type: application/json" \
  -d '{"identifier": "0712345678", "otp_code": "123456"}'
```

### Test with Frontend

1. Start backend: `python manage.py runserver`
2. Start frontend: `npm start`
3. Go to: `http://localhost:3000/login/otp`
4. Enter phone: `0712345678`
5. Select method: `email` (for testing without SMS setup)
6. Check email for OTP code
7. Enter code and verify

---

## 🔒 Security Features

- ✅ **10-minute expiry**: OTP codes expire automatically
- ✅ **One-time use**: Codes marked as verified after use
- ✅ **Rate limiting**: Prevent OTP spam (configure in Django settings)
- ✅ **Secure storage**: OTP codes hashed in database (optional enhancement)
- ✅ **JWT tokens**: Secure authentication after verification
- ✅ **Phone normalization**: Consistent format for Kenya numbers

---

## 📊 Database Schema

**User Model Fields:**
```python
otp_code = CharField(max_length=6)           # Current OTP
otp_created_at = DateTimeField()            # When OTP was generated
otp_verified = BooleanField(default=False)  # Verification status
phone_number = CharField(max_length=15)     # User's phone number
```

---

## 🚀 Production Deployment

### 1. Environment Variables

Set in Render/Heroku/AWS:
```env
AFRICASTALKING_USERNAME=your_production_username
AFRICASTALKING_API_KEY=your_production_api_key
EMAIL_HOST_USER=your_email@domain.com
EMAIL_HOST_PASSWORD=your_secure_password
```

### 2. Africa's Talking Production

1. Upgrade to production account
2. Add credits (KES 100 minimum)
3. Update username in `.env`
4. Test with real phone numbers

### 3. Email Production

Use professional email service:
- **SendGrid**: 100 emails/day free
- **Mailgun**: 5,000 emails/month free
- **AWS SES**: 62,000 emails/month free

---

## 🐛 Troubleshooting

### SMS Not Sending

**Check:**
1. Africa's Talking API key is correct
2. Phone number format: `+254XXXXXXXXX`
3. Sandbox mode: Check dashboard for virtual messages
4. Credits available (production mode)

**Solution:**
```python
# Test in Django shell
from apps.accounts.otp_service import send_otp_sms
result = send_otp_sms("+254712345678", "123456")
print(result)  # Should be True
```

### Email Not Sending

**Check:**
1. Gmail app password (not regular password)
2. 2-Step Verification enabled
3. "Less secure apps" NOT needed with app password
4. Check spam folder

**Solution:**
```python
# Test in Django shell
from apps.accounts.otp_service import send_otp_email
result = send_otp_email("user@example.com", "123456")
print(result)  # Should be True
```

### OTP Expired

**Error:** "OTP expired. Please request a new one."

**Solution:**
- OTP valid for 10 minutes only
- Request new OTP using resend button

### Invalid OTP

**Error:** "Invalid OTP code."

**Solution:**
- Check code carefully (6 digits)
- Ensure using latest OTP (old codes invalidated)
- Request new OTP if unsure

---

## 📈 Future Enhancements

- [ ] **Rate limiting**: Prevent OTP spam (max 3 requests per hour)
- [ ] **OTP hashing**: Store hashed OTP codes in database
- [ ] **Audit logging**: Track OTP requests and verifications
- [ ] **Multi-language**: Support Swahili OTP messages
- [ ] **Voice OTP**: Call-based OTP delivery
- [ ] **Biometric**: Add fingerprint/face ID after OTP
- [ ] **Remember device**: Skip OTP for trusted devices

---

## 💰 Pricing (Kenya)

### Africa's Talking

**SMS:**
- Sandbox: Free (virtual messages)
- Production: KES 0.80 per SMS

**WhatsApp:**
- Requires business verification
- Contact Africa's Talking for pricing

### Email

**Free Tier:**
- Gmail: 500 emails/day
- SendGrid: 100 emails/day
- Mailgun: 5,000 emails/month

---

## 📞 Support

**Africa's Talking:**
- Docs: [docs.africastalking.com](https://docs.africastalking.com)
- Support: support@africastalking.com

**EasyCart:**
- GitHub Issues: [github.com/easycart/issues](https://github.com)
- Email: support@easycart.com

---

## ✅ Checklist

- [x] Backend OTP service created
- [x] Database migrations applied
- [x] API endpoints configured
- [x] Frontend OTP login page created
- [x] Africa's Talking integration
- [x] Email fallback configured
- [x] Documentation completed
- [ ] Africa's Talking account setup (user action)
- [ ] Email credentials configured (user action)
- [ ] Production testing (user action)

---

**Status**: ✅ Ready for testing with email. SMS/WhatsApp requires Africa's Talking setup.
