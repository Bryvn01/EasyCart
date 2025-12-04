# Twilio Trial Account - Verify Phone Numbers

## ⚠️ Trial Account Limitation

Your Twilio trial account can only send SMS to **verified phone numbers**.

## 🔧 Verify Your Phone Number

### Step 1: Go to Verified Numbers

1. Login to [Twilio Console](https://console.twilio.com)
2. Go to **Phone Numbers** → **Manage** → **Verified Caller IDs**
3. Or direct link: [console.twilio.com/us1/develop/phone-numbers/manage/verified](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)

### Step 2: Add Phone Number

1. Click **"+ Add a new number"**
2. Enter phone: `+254723796116` (or your test number)
3. Click **"Call me with a verification code"** or **"Text me"**
4. Enter the code you receive
5. Click **"Verify"**

### Step 3: Test Again

```bash
cd backend
python -c "from apps.accounts.otp_service import send_otp_sms; send_otp_sms('+254723796116', '123456')"
```

**Expected:** SMS received successfully

---

## 🎯 Quick Test with OTP Login

1. **Verify your phone** in Twilio Console
2. **Start backend**: `python manage.py runserver`
3. **Start frontend**: `npm start`
4. **Go to**: `http://localhost:3000/login/otp`
5. **Enter phone**: `+254723796116` (or your verified number)
6. **Select**: SMS
7. **Get code** via SMS
8. **Verify** and login

---

## 💡 Alternative: Use Email (No Verification Needed)

Email OTP works immediately without any setup:

1. Go to: `http://localhost:3000/login/otp`
2. Enter email
3. Select "Email"
4. Get code from email
5. Verify and login

---

## 🚀 Remove Trial Limitations

To send SMS to any number:

1. **Upgrade Account**:
   - Go to [Billing](https://console.twilio.com/us1/billing/manage-billing/billing-overview)
   - Add payment method
   - No monthly fee, pay per SMS

2. **Pricing**:
   - Kenya SMS: $0.05 per message
   - No setup fees
   - No monthly charges

---

## 📞 Support

- **Twilio Console**: [console.twilio.com](https://console.twilio.com)
- **Verify Numbers**: [console.twilio.com/us1/develop/phone-numbers/manage/verified](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)
- **Support**: [support.twilio.com](https://support.twilio.com)

---

**Status**: ✅ Twilio configured. Verify phone numbers to test SMS OTP.
