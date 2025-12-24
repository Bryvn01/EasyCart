# 📱 Twilio Configuration Guide

## Quick Setup (5 minutes)

### Step 1: Create Twilio Account
1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a **FREE trial account** (no credit card required for trial)
3. Verify your email and phone number

### Step 2: Get Your Credentials

#### Option A: Using Twilio Console (Recommended)
1. Visit [https://console.twilio.com/](https://console.twilio.com/)
2. On the dashboard, you'll see:
   ```
   Account SID:  ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Auth Token:   Click "Show" to reveal your token
   ```
3. Copy both values

#### Option B: Using Twilio CLI
```bash
# Install Twilio CLI
npm install twilio-cli -g

# Login
twilio login

# Get credentials
twilio profiles:list
```

### Step 3: Get a Phone Number

#### For SMS (Required)
1. Go to [Phone Numbers > Manage > Buy a number](https://console.twilio.com/us1/develop/phone-numbers/manage/search)
2. Select your country (e.g., Kenya +254, US +1)
3. Filter by capabilities: **SMS** ✅
4. Click **Buy** (Trial accounts get $15 credit)
5. Copy your new number in E.164 format: `+254712345678`

#### For WhatsApp (Optional but Recommended)
**Trial Mode (Sandbox - Instant Setup):**
1. Go to [Messaging > Try it out > Send a WhatsApp message](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. You'll see: `join [unique-code]`
3. Send that message from your phone to: `+1 415 523 8886`
4. Use `whatsapp:+14155238886` as your `TWILIO_WHATSAPP_NUMBER`

**Production Mode (After Trial):**
1. Go to [WhatsApp Senders](https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders)
2. Submit your business profile for approval
3. Get your approved WhatsApp number

### Step 4: Update Your .env File

Open `backend/.env` and add your credentials:

```bash
# Twilio Configuration (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=<your_twilio_account_sid>  # From Step 2
TWILIO_AUTH_TOKEN=<your_twilio_auth_token>                  # From Step 2
TWILIO_PHONE_NUMBER=+254712345678                       # From Step 3 (SMS)
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886            # From Step 3 (WhatsApp sandbox)
```

### Step 5: Restart Your Server

```bash
# If using PowerShell
cd C:\EasyCart\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver

# The warning "Twilio not configured" should disappear ✅
```

---

## 🧪 Testing Your Configuration

### Test SMS Delivery
```python
# In Django shell
python manage.py shell

from apps.accounts.otp_service import send_otp_sms
result = send_otp_sms("+254712345678", "123456")
print(result)  # Should print True
```

### Test WhatsApp Delivery
```python
from apps.accounts.otp_service import send_otp_whatsapp
result = send_otp_whatsapp("+254712345678", "123456")
print(result)  # Should print True
```

### Test via API (Postman/cURL)
```bash
curl -X POST http://localhost:8000/api/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+254712345678",
    "method": "sms"
  }'
```

---

## 💰 Pricing & Trial Limits

### Trial Account (FREE)
- **Credit:** $15.00 USD
- **SMS Cost:** ~$0.0075 per message (Kenya: ~2000 free SMS)
- **WhatsApp Sandbox:** FREE (unlimited in sandbox mode)
- **Limitations:**
  - Can only send to verified phone numbers
  - Shows "Sent from your Twilio trial account" prefix

### Verified Phone Numbers (Trial)
Add numbers that can receive messages:
1. Go to [Phone Numbers > Manage > Verified Caller IDs](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)
2. Click **Add a new Caller ID**
3. Enter phone number → Receive verification code → Verify

### Production Account (Paid)
- Upgrade anytime: [https://console.twilio.com/billing](https://console.twilio.com/billing)
- Removes "trial account" prefix
- Send to any phone number (no verification needed)
- Volume discounts available

---

## 🔧 Troubleshooting

### Issue: "Twilio not configured" Warning
**Solution:** Ensure all 3 variables are set in `.env`:
```bash
TWILIO_ACCOUNT_SID=<your_twilio_account_sid>  # Must start with AC
TWILIO_AUTH_TOKEN=<your_twilio_auth_token>     # 32 characters
TWILIO_PHONE_NUMBER=+254712345678                      # Must include country code
```

### Issue: "Unable to create record: The number is unverified"
**Solution (Trial Account):**
1. Verify the recipient's number at [Verified Caller IDs](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)
2. **OR** upgrade to a paid account (no verification needed)

### Issue: "Invalid 'To' Phone Number"
**Solution:** Ensure phone number is in **E.164 format**:
- ✅ Correct: `+254712345678` (Kenya)
- ✅ Correct: `+1234567890` (US)
- ❌ Wrong: `0712345678` (missing country code)
- ❌ Wrong: `254712345678` (missing + symbol)

### Issue: WhatsApp messages not delivering
**Solution (Sandbox Mode):**
1. Make sure recipient sent `join [code]` to `+1 415 523 8886`
2. Check sandbox status at [WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
3. Note: Sandbox links expire after 72 hours of inactivity

### Issue: "Authentication failed"
**Solution:**
1. Verify `TWILIO_ACCOUNT_SID` starts with `AC`
2. Regenerate Auth Token if compromised:
   - Go to [Account Settings](https://console.twilio.com/us1/account/manage-account)
   - Click **API Credentials**
   - Create new Auth Token
3. Update `.env` with new token

---

## 🌍 Country-Specific Pricing

### Kenya (+254)
- **SMS:** $0.0365 per message
- **WhatsApp:** $0.0047 per conversation (24-hour window)
- **Regulations:** No special requirements

### United States (+1)
- **SMS:** $0.0079 per message
- **WhatsApp:** $0.0055 per conversation
- **Regulations:** Requires 10DLC registration for A2P messaging

### United Kingdom (+44)
- **SMS:** $0.0400 per message
- **WhatsApp:** $0.0091 per conversation
- **Regulations:** Requires sender ID registration

### Check Your Country
Visit: [https://www.twilio.com/en-us/sms/pricing](https://www.twilio.com/en-us/sms/pricing)

---

## 🔐 Security Best Practices

### 1. Rotate Auth Tokens Regularly
```bash
# Every 90 days, regenerate your Auth Token
# Update .env with new token
# Restart server
```

### 2. Use Environment Variables (Not Hardcoded)
```python
# ✅ GOOD
account_sid = os.getenv('TWILIO_ACCOUNT_SID')

# ❌ BAD
account_sid = 'AC1234567890abcdef'  # Never hardcode!
```

### 3. Restrict IP Addresses (Production)
1. Go to [Account Settings > API Restrictions](https://console.twilio.com/us1/account/manage-account)
2. Enable **IP Access Control Lists**
3. Add your server's IP address

### 4. Monitor Usage
- Set up [Usage Triggers](https://console.twilio.com/us1/monitor/triggers/usage)
- Get alerts when spending exceeds threshold
- Prevent unexpected charges

---

## 📊 Monitoring & Logs

### View Message Logs
1. Go to [Monitor > Logs > Messaging](https://console.twilio.com/us1/monitor/logs/messaging)
2. Filter by:
   - Date range
   - Status (delivered, failed, undelivered)
   - From/To numbers

### Common Status Codes
| Status | Meaning | Action |
|--------|---------|--------|
| `queued` | Message queued for delivery | Normal (temporary) |
| `sent` | Message sent to carrier | Success ✅ |
| `delivered` | Message received by user | Success ✅ |
| `undelivered` | Failed to deliver | Check number validity |
| `failed` | Permanent failure | Contact Twilio support |

### Export Logs
```bash
# Using Twilio CLI
twilio api:core:messages:list \
  --date-sent-after 2024-01-01 \
  --page-size 100 \
  -o json > messages.json
```

---

## 🚀 Advanced Configuration

### SMS Fallback to WhatsApp
Already configured in `otp_service.py`:
```python
# Automatic fallback order:
# 1. Try SMS first
# 2. If SMS fails, try WhatsApp
# 3. If WhatsApp fails, try email
# 4. If email fails, console logging (DEBUG mode)
```

### Rate Limiting (Already Configured)
```python
# backend/ecommerce/settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_RATES': {
        'otp_request': '5/hour',  # 5 OTP requests per hour
        'otp_verify': '10/hour',  # 10 verification attempts
    }
}
```

### Custom Message Templates
Edit `backend/apps/accounts/otp_service.py`:
```python
def send_otp_sms(phone_number, otp_code):
    message = f"""
    🔐 Your EasyCart OTP: {otp_code}

    Valid for 10 minutes.
    Don't share this code with anyone!

    - EasyCart Security Team
    """
```

---

## 🆘 Support Resources

### Official Documentation
- [Twilio SMS Quickstart](https://www.twilio.com/docs/sms/quickstart/python)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp/quickstart/python)
- [Error Codes Reference](https://www.twilio.com/docs/api/errors)

### EasyCart Support
- **Issue Tracker:** [GitHub Issues](https://github.com/Bryvn01/EasyCart/issues)
- **Email:** admin@easycart.com
- **Documentation:** See `backend/apps/accounts/README.md`

### Twilio Support
- **Support Portal:** [https://support.twilio.com](https://support.twilio.com)
- **Community Forum:** [https://www.twilio.com/community](https://www.twilio.com/community)
- **Status Page:** [https://status.twilio.com](https://status.twilio.com)

---

## ✅ Configuration Checklist

- [ ] Created Twilio account
- [ ] Obtained Account SID
- [ ] Obtained Auth Token
- [ ] Purchased/obtained SMS phone number
- [ ] Set up WhatsApp sandbox (optional)
- [ ] Updated `.env` file with all credentials
- [ ] Restarted Django server
- [ ] Verified phone numbers (for trial)
- [ ] Tested SMS delivery
- [ ] Tested WhatsApp delivery (if configured)
- [ ] Checked message logs in Twilio console
- [ ] Set up usage alerts (recommended)

---

## 🎉 You're All Set!

Your EasyCart application can now send:
- ✅ SMS OTP codes
- ✅ WhatsApp OTP codes
- ✅ Email OTP codes (fallback)
- ✅ Console logging (development mode)

**Next Steps:**
1. Test the OTP flow end-to-end
2. Monitor your Twilio dashboard for delivery stats
3. Consider upgrading to production account when ready

**Questions?** Open an issue or check the troubleshooting section above.
