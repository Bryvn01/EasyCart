# Twilio Quick Start for EasyCart

## ✅ Already Done

- ✅ Twilio SDK installed
- ✅ Code updated to use Twilio
- ✅ Email OTP working (no setup needed)

## 🚀 Setup Twilio (5 Minutes)

### 1. Create Free Account

1. Go to [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up (get $15 free credit)
3. Verify your email and phone

### 2. Get Credentials

From [Twilio Console](https://console.twilio.com):

**Account Info:**
- Account SID: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Auth Token: Click "Show" to reveal

**Get Phone Number:**
1. Click "Get a Trial Number"
2. Accept the number (e.g., `+12345678901`)

### 3. Configure Backend

Add to `backend/.env`:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+12345678901
```

### 4. Test SMS

```bash
cd backend
python manage.py shell
```

```python
from apps.accounts.otp_service import send_otp_sms
send_otp_sms("+254712345678", "123456")
```

**Expected:** SMS received with code

---

## 📱 Trial Account Limitations

**Free Trial:**
- ✅ $15 credit (~300 SMS)
- ✅ Works immediately
- ⚠️ Can only send to verified numbers
- ⚠️ Messages prefixed with "Sent from your Twilio trial account"

**To Remove Limitations:**
1. Upgrade account (add payment method)
2. No monthly fee
3. Pay per SMS: $0.0075 - $0.05 per message

---

## 🔧 Verify Phone Numbers (Trial)

**Add Test Numbers:**

1. Go to [Verified Caller IDs](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)
2. Click "Add a new number"
3. Enter phone: `+254712345678`
4. Verify via SMS code
5. Repeat for all test numbers

---

## 💰 Pricing (Kenya)

**SMS:**
- Kenya: $0.05 per SMS
- Trial: $15 free credit = 300 SMS

**WhatsApp:**
- Requires Business API approval
- $0.005 - $0.01 per message

**No Monthly Fees** - Pay only for what you use

---

## ✅ Test OTP Login

### With Email (Works Now)
```bash
# 1. Start backend
cd backend
python manage.py runserver

# 2. Go to: http://localhost:3000/login/otp
# 3. Enter email, select "Email"
# 4. Get code from email, verify
```

### With SMS (After Twilio Setup)
```bash
# Same steps, but:
# 1. Enter phone: +254712345678
# 2. Select "SMS"
# 3. Get code via SMS
```

---

## 🐛 Troubleshooting

### "Unable to create record"
- **Cause:** Phone not verified (trial account)
- **Fix:** Add phone to Verified Caller IDs

### "Authentication Error"
- **Cause:** Wrong credentials
- **Fix:** Double-check Account SID and Auth Token

### "Invalid phone number"
- **Cause:** Wrong format
- **Fix:** Use `+254XXXXXXXXX` format

---

## 🎯 Recommendation

**For Now:**
- ✅ Use **Email OTP** (already working)
- ✅ No setup needed
- ✅ Free unlimited

**For Production:**
- Upgrade Twilio account
- Remove trial limitations
- Enable SMS for customers who prefer it

---

## 📞 Support

- **Twilio Docs**: [twilio.com/docs](https://www.twilio.com/docs)
- **Support**: [support.twilio.com](https://support.twilio.com)
- **Console**: [console.twilio.com](https://console.twilio.com)

---

**Status**: ✅ Email OTP working. SMS optional (requires Twilio setup).
