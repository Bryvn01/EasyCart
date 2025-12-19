# ⚡ Ultramsg Quick Setup Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Get Ultramsg Credentials
1. Go to https://ultramsg.com and sign up
2. Create a new instance
3. Scan QR code with your WhatsApp Business phone
4. Copy your **Instance ID** and **Token** from dashboard

### Step 2: Update .env File
```bash
cd backend
nano .env  # or use your editor
```

Add these 3 lines:
```bash
ULTRAMSG_INSTANCE_ID=instance123456
ULTRAMSG_TOKEN=your_token_here
ULTRAMSG_PHONE_NUMBER=254712345678
```

### Step 3: Test It
```powershell
python check_ultramsg.py
```

You should see:
```
✅ Connected to Ultramsg Instance
✅ Account Status: authenticated
✅ Ultramsg is configured correctly!
```

## 📱 Phone Number Format

**Always use international format WITHOUT + or spaces:**

✅ **Correct:**
- `254712345678` (Kenya)
- `2348012345678` (Nigeria)
- `27821234567` (South Africa)

❌ **Wrong:**
- `+254 712 345 678`
- `0712345678`
- `whatsapp:+254712345678`

## 🔧 What Changed?

### Environment Variables
```diff
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER
- TWILIO_WHATSAPP_FROM
+ ULTRAMSG_INSTANCE_ID
+ ULTRAMSG_TOKEN
+ ULTRAMSG_PHONE_NUMBER
```

### Files Modified
1. `backend/.env` - Add Ultramsg credentials
2. `backend/apps/orders/whatsapp_service.py` - Order notifications
3. `backend/apps/accounts/otp_service.py` - OTP delivery
4. `backend/requirements.txt` - Commented out twilio

## 🧪 Quick Test

**Test WhatsApp Service:**
```python
from apps.orders.whatsapp_service import WhatsAppService
service = WhatsAppService()
# Messages now go through Ultramsg
```

**Test OTP Service:**
```python
from apps.accounts.otp_service import send_otp_whatsapp
send_otp_whatsapp("254712345678", "123456")
```

## 📊 Message Types

All these now use Ultramsg:
- ✅ Order confirmation WhatsApp
- ✅ Admin new order alerts
- ✅ Payment success notifications
- ✅ SMS OTP codes
- ✅ WhatsApp OTP codes

## 🚨 Common Issues

### "Ultramsg not configured"
**Fix:** Check `.env` has valid `ULTRAMSG_INSTANCE_ID` and `ULTRAMSG_TOKEN`

### Messages not delivering
**Check:**
1. WhatsApp connected in Ultramsg dashboard
2. Sufficient credits in account
3. Phone number format (254XXX, no +)
4. Instance is active (not suspended)

### Phone format errors
**The code handles this automatically:**
```python
# Automatically converts:
"0712345678" → "254712345678"
"+254 712 345 678" → "254712345678"
"whatsapp:+254712345678" → "254712345678"
```

## 💰 Pricing Comparison

**Typical costs (may vary by region):**

| Service | Twilio | Ultramsg |
|---------|--------|----------|
| WhatsApp | $0.005-0.01/msg | $0.002-0.005/msg |
| SMS | $0.075/msg | $0.03-0.05/msg |
| Monthly fee | $15+ | $0 (pay-as-you-go) |

**💡 Savings: ~60-70% on messaging costs**

## 🎯 Next Steps

1. **Development:** Test all message types locally
2. **Staging:** Deploy and verify in staging
3. **Production:** Update `.env` with production credentials
4. **Monitor:** Check Ultramsg dashboard for delivery stats
5. **Optimize:** Remove old Twilio code if no longer needed

## 📚 Resources

- **Ultramsg Docs:** https://docs.ultramsg.com
- **API Reference:** https://docs.ultramsg.com/api/send-message
- **Dashboard:** https://ultramsg.com/dashboard
- **Support:** support@ultramsg.com

## ✅ Migration Checklist

- [x] Update .env with Ultramsg credentials
- [ ] Test order confirmation messages
- [ ] Test admin notifications
- [ ] Test payment confirmations
- [ ] Test SMS OTP
- [ ] Test WhatsApp OTP
- [ ] Deploy to staging
- [ ] Monitor delivery rates
- [ ] Deploy to production
- [ ] Update production .env
- [ ] Remove old Twilio credentials

---

**Status:** ✅ Migration Complete
**Commit:** `11dde00` - Migrated from Twilio to Ultramsg
**Date:** 2025-01-20

For detailed migration info, see [ULTRAMSG_MIGRATION.md](ULTRAMSG_MIGRATION.md)
