# 🚀 Twilio Quick Start (2 Minutes)

## What You Need
1. Twilio Account SID (starts with `AC`)
2. Twilio Auth Token (32 characters)
3. Twilio Phone Number (E.164 format: `+254712345678`)

---

## Step-by-Step

### 1️⃣ Create Free Account
👉 [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
- No credit card required
- Get $15 free credit (~2000 SMS in Kenya)

### 2️⃣ Get Credentials
👉 [https://console.twilio.com/](https://console.twilio.com/)

Copy these from your dashboard:
```
Account SID:  ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token:   Click "Show" to reveal
```

### 3️⃣ Get Phone Number
👉 [Buy Number](https://console.twilio.com/us1/develop/phone-numbers/manage/search)
- Select your country
- Filter by **SMS** capability
- Click **Buy** (free with trial credit)

### 4️⃣ Update .env File
Open `backend/.env`:
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 5️⃣ Restart Server
```bash
cd C:\EasyCart\backend
python manage.py runserver
```

✅ **Done!** Warning should disappear.

---

## 🧪 Quick Test

### Test via API
```bash
curl -X POST http://localhost:8000/api/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+254712345678",
    "method": "sms"
  }'
```

### Test via Django Shell
```python
python manage.py shell

from apps.accounts.otp_service import send_otp_sms
send_otp_sms("+254712345678", "123456")
# Should return: True
```

---

## ⚠️ Trial Account Limitations

### Must verify phone numbers first:
1. Go to [Verified Caller IDs](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)
2. Click **Add new number**
3. Enter number → receive code → verify

### OR upgrade to paid account:
- Removes verification requirement
- Removes "trial account" prefix from messages

---

## 🌐 Phone Number Format (E.164)

✅ **Correct:**
```
+254712345678  (Kenya)
+1234567890    (USA)
+447123456789  (UK)
```

❌ **Wrong:**
```
0712345678     (missing country code)
254712345678   (missing + symbol)
+254 712 345 678  (has spaces)
```

---

## 💡 Pro Tips

1. **WhatsApp Sandbox (FREE):**
   - Go to [WhatsApp Learn](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
   - Send `join [code]` to `+1 415 523 8886`
   - Add to .env: `TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886`

2. **Monitor Usage:**
   - [View logs](https://console.twilio.com/us1/monitor/logs/messaging)
   - [Set alerts](https://console.twilio.com/us1/monitor/triggers/usage)

3. **Keep Credentials Safe:**
   - ✅ Use `.env` file
   - ❌ Never commit to git
   - ✅ Add `.env` to `.gitignore`

---

## 🆘 Common Issues

### "Authentication Error 20003"
→ Check TWILIO_ACCOUNT_SID starts with `AC`

### "Number not verified"
→ Trial accounts: Verify recipient number in console
→ OR upgrade to paid account

### "Invalid phone number format"
→ Use E.164 format: `+[country][number]`

### Messages not sending
→ Check [Twilio Status](https://status.twilio.com)
→ View [Message Logs](https://console.twilio.com/us1/monitor/logs/messaging)

---

## 📚 Full Documentation
See [TWILIO_SETUP_GUIDE.md](TWILIO_SETUP_GUIDE.md) for complete guide

---

**Questions?** Open an issue: [GitHub Issues](https://github.com/Bryvn01/EasyCart/issues)
