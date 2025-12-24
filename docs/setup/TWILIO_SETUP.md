# Twilio SMS Setup for EasyCart

## Why Twilio?

- **Custom Sender Name**: Show "EasyCart" instead of phone number
- **Global Coverage**: Works in 180+ countries
- **Reliable**: 99.95% uptime SLA
- **Alphanumeric Sender ID**: Available in many countries

## Setup Steps

### 1. Create Twilio Account

1. Sign up at [twilio.com](https://www.twilio.com/try-twilio)
2. Get free trial credits ($15)
3. Verify your phone number

### 2. Get Credentials

From Twilio Console:
- **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Auth Token**: `your_auth_token`
- **Phone Number**: `+1234567890` (or buy one)

### 3. Register Alphanumeric Sender ID

**For Kenya:**
1. Go to **Messaging → Sender IDs**
2. Click **"Register a Sender ID"**
3. Enter: `EASYCART`
4. Select country: **Kenya**
5. Submit required documents
6. Wait for approval (3-5 business days)

**Supported Countries:**
- Kenya, Nigeria, South Africa, Ghana, Uganda, Tanzania
- UK, Germany, France, Spain, Italy
- India, Singapore, Malaysia, Philippines

### 4. Install Twilio SDK

```bash
cd backend
pip install twilio
```

### 5. Update Environment Variables

Add to `backend/.env`:
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=<your_twilio_account_sid>
TWILIO_AUTH_TOKEN=<your_twilio_auth_token>
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_SENDER_ID=EASYCART
```

### 6. Update OTP Service

Replace Africa's Talking code in `apps/accounts/otp_service.py`:

```python
from twilio.rest import Client
from decouple import config

# Twilio Configuration
TWILIO_ACCOUNT_SID = config('TWILIO_ACCOUNT_SID', default='')
TWILIO_AUTH_TOKEN = config('TWILIO_AUTH_TOKEN', default='')
TWILIO_PHONE_NUMBER = config('TWILIO_PHONE_NUMBER', default='')
TWILIO_SENDER_ID = config('TWILIO_SENDER_ID', default='EASYCART')

if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
else:
    twilio_client = None

def send_otp_sms(phone_number, otp_code):
    """Send OTP via SMS using Twilio"""
    if not twilio_client:
        logger.error("Twilio not configured")
        return False

    try:
        # Ensure phone number has country code
        if not phone_number.startswith('+'):
            phone_number = f'+254{phone_number.lstrip("0")}'

        message = f"Your EasyCart verification code is: {otp_code}\\nValid for 10 minutes."

        # Use alphanumeric sender ID if available, otherwise use phone number
        from_number = TWILIO_SENDER_ID if TWILIO_SENDER_ID else TWILIO_PHONE_NUMBER

        message = twilio_client.messages.create(
            body=message,
            from_=from_number,
            to=phone_number
        )

        logger.info(f"SMS sent to {phone_number}: {message.sid}")
        return True
    except Exception as e:
        logger.error(f"Twilio SMS failed: {str(e)}")
        return False
```

## Pricing Comparison

### Africa's Talking (Kenya)
- **SMS**: KES 0.80 per SMS (~$0.006)
- **Sender ID**: Free
- **Best for**: Kenya, East Africa

### Twilio
- **SMS**: $0.05 per SMS (Kenya)
- **Sender ID**: Free registration
- **Phone Number**: $1/month
- **Best for**: Global coverage

## Recommendations

**Use Africa's Talking if:**
- ✅ Targeting Kenya/East Africa only
- ✅ Want lowest cost
- ✅ Need local support

**Use Twilio if:**
- ✅ Need global coverage
- ✅ Want advanced features (delivery reports, analytics)
- ✅ Need 99.95% SLA

## Current Implementation

EasyCart uses **Africa's Talking** by default. To switch to Twilio:

1. Install Twilio SDK
2. Update `otp_service.py` with Twilio code
3. Add Twilio credentials to `.env`
4. Register sender ID

## Testing

**Test SMS:**
```bash
cd backend
python manage.py shell
```

```python
from apps.accounts.otp_service import send_otp_sms
send_otp_sms("+254712345678", "123456")
```

**Expected Result:**
- SMS received with sender: **EASYCART**
- Message: "Your EasyCart verification code is: 123456"

## Troubleshooting

**Sender ID not showing:**
- Check if sender ID is approved
- Some carriers don't support alphanumeric IDs
- Fallback to phone number if needed

**SMS not delivered:**
- Verify phone number format: `+254XXXXXXXXX`
- Check Twilio/Africa's Talking balance
- Review delivery logs in dashboard

## Support

- **Africa's Talking**: support@africastalking.com
- **Twilio**: support.twilio.com
