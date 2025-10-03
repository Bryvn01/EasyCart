# Authentication Features Configuration Guide

This guide explains how to configure the enhanced authentication features in EasyCart.

## Email Verification and Password Reset

EasyCart now includes email verification and password reset functionality. To enable email sending in production:

### 1. Email Configuration

Add the following environment variables to your `.env` file:

```bash
# Email Settings (Choose one backend)

# Option 1: Console Backend (Development - prints emails to console)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Option 2: SMTP (Gmail example)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@easycart.com

# Option 3: SendGrid
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@easycart.com

# Frontend URL (for email links)
FRONTEND_URL=https://your-frontend-domain.com
```

### 2. Gmail Setup (if using Gmail)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings → Security
   - Under "Signing in to Google", select "App passwords"
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_HOST_PASSWORD`

### 3. SendGrid Setup (Recommended for Production)

1. Create a free account at https://sendgrid.com
2. Verify your sender domain or email
3. Generate an API key
4. Use the API key as `EMAIL_HOST_PASSWORD`

## Available Authentication Features

### 1. User Registration
- **Endpoint:** `POST /api/auth/register/`
- **Features:** 
  - Email/password registration
  - Password confirmation validation
  - Secure password hashing
  - Optional email verification

### 2. User Login
- **Endpoint:** `POST /api/auth/login/`
- **Features:**
  - JWT token authentication
  - Refresh token support
  - Automatic token refresh on expiry

### 3. Email Verification
- **Send Verification:** `POST /api/auth/send-verification-email/`
- **Verify Email:** `POST /api/auth/verify-email/`
- **Features:**
  - Token-based verification
  - 24-hour expiry
  - User-friendly email templates

### 4. Password Reset
- **Request Reset:** `POST /api/auth/forgot-password/`
- **Reset Password:** `POST /api/auth/reset-password/`
- **Features:**
  - Secure token-based reset
  - Email with reset link
  - 24-hour expiry

### 5. Password Change
- **Endpoint:** `POST /api/auth/change-password/`
- **Features:**
  - Requires current password verification
  - Minimum 8 characters
  - Available in user profile

### 6. Profile Management
- **Get Profile:** `GET /api/auth/profile/`
- **Update Profile:** `PUT /api/auth/profile/`
- **Features:**
  - Edit username, phone, address
  - Email is read-only (security)
  - Password change form

## OAuth Integration (Future Enhancement)

To add OAuth authentication (e.g., Google, Facebook), you can use `django-allauth`:

### Installation

```bash
pip install django-allauth
```

### Configuration

Add to `settings.py`:

```python
INSTALLED_APPS += [
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
]

SITE_ID = 1

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    }
}
```

### Frontend Integration

Add Google Sign-In button to Login/Register pages:

```javascript
<button 
  onClick={() => window.location.href = '/api/auth/google/login/'}
  className="btn btn-secondary"
>
  <img src="/google-icon.svg" alt="Google" />
  Sign in with Google
</button>
```

## Security Best Practices

1. **Password Requirements:**
   - Minimum 8 characters
   - Password confirmation on registration
   - Secure hashing with Django's built-in system

2. **Token Security:**
   - JWT tokens with 60-minute lifetime
   - Refresh tokens with 7-day lifetime
   - Automatic token rotation

3. **Email Security:**
   - Don't reveal if email exists (prevents enumeration)
   - Token expiry after 24 hours
   - One-time use tokens

4. **Rate Limiting:**
   - Login: 5 attempts per minute
   - Registration: 3 attempts per minute
   - General API: 100 requests per hour (anonymous)

## Testing

### Development Mode

In development (DEBUG=True), email content is printed to console and URLs are returned in API responses for easy testing.

### Production Mode

In production (DEBUG=False):
- Actual emails are sent
- URLs are not returned in responses
- All security features are enabled

## Troubleshooting

### Emails not sending

1. Check email backend configuration
2. Verify SMTP credentials
3. Check firewall/security group rules for port 587
4. Look for errors in Django logs

### Token expired errors

- Tokens expire after 24 hours for security
- User needs to request a new reset/verification email

### Can't change email

- Email changes are disabled for security
- User must create a new account with different email

## API Response Examples

### Registration Success
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "email_verified": false
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Email Verification Sent
```json
{
  "message": "Verification email sent"
}
```

### Password Reset Success
```json
{
  "message": "Password reset successful"
}
```

## Database Migration

The email_verified field has been added to the User model. Run migrations:

```bash
cd backend
python manage.py migrate accounts
```

## Frontend Routes

- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Request password reset
- `/reset-password?uid=...&token=...` - Reset password with token
- `/verify-email?uid=...&token=...` - Verify email with token
- `/profile` - User profile with password change

## Support

For issues or questions about authentication features:
1. Check the Django logs for detailed error messages
2. Verify environment variables are set correctly
3. Test email configuration with Django's shell:
   ```bash
   python manage.py shell
   >>> from django.core.mail import send_mail
   >>> send_mail('Test', 'Test message', 'from@example.com', ['to@example.com'])
   ```
