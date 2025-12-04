# Email Setup for OTP

## Quick Setup (5 Minutes)

### 1. Generate Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select:
   - App: **Mail**
   - Device: **Other** (enter "EasyCart")
5. Click **Generate**
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### 2. Update .env File

Edit `backend/.env`:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop
DEFAULT_FROM_EMAIL=noreply@easycart.com
```

**Replace:**
- `your_email@gmail.com` - Your Gmail address
- `abcdefghijklmnop` - The 16-char app password (no spaces)

### 3. Restart Backend

```bash
# Stop backend (Ctrl+C)
cd backend
python manage.py runserver
```

### 4. Test OTP

1. Go to: `http://localhost:3000/login/otp`
2. Enter your email
3. Select "Email"
4. Click "Send OTP"
5. Check your email inbox
6. Enter the 6-digit code

## ✅ Done!

OTP emails will now be sent from your Gmail account.

## Troubleshooting

### "Authentication failed"
- Double-check app password (no spaces)
- Ensure 2-Step Verification is enabled
- Use app password, not regular password

### "No email received"
- Check spam folder
- Verify EMAIL_HOST_USER is correct
- Check backend logs for errors

### "Connection refused"
- Check EMAIL_PORT=587
- Ensure EMAIL_USE_TLS=True
- Try EMAIL_PORT=465 with EMAIL_USE_SSL=True

## Alternative: Use Console Backend (Development)

For testing without email setup:

```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

Emails will print in the backend terminal instead of sending.
