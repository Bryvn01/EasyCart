# Authentication Features - Quick Reference

## Overview

EasyCart now includes comprehensive authentication and account management features:

✅ **User Registration** with email/password  
✅ **User Login** with JWT tokens  
✅ **Email Verification** with token-based verification  
✅ **Password Reset** with secure token links  
✅ **Password Change** in user profile  
✅ **Profile Management** with editable details  
✅ **Secure Password Storage** with Django hashing  

## Quick Start

### For Developers

1. **Backend Setup:**
   ```bash
   cd backend
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Configure email (optional, defaults to console)
   cp .env.example .env
   # Edit .env and set EMAIL_* variables
   
   # Run migrations
   python manage.py migrate
   
   # Start server
   python manage.py runserver
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start development server
   npm start
   ```

### For Users

1. **Register** at `/register`
   - Provide username, email, and password
   - Password must be at least 8 characters
   - Confirm password to proceed

2. **Verify Email** (optional)
   - Check your email for verification link
   - Click link to verify account

3. **Login** at `/login`
   - Use email and password
   - Receive JWT tokens for authenticated requests

4. **Forgot Password?**
   - Click "Forgot Password?" on login page
   - Enter your email
   - Check email for reset link
   - Click link to reset password

5. **Manage Profile** at `/profile`
   - Update username, phone, address
   - Change password
   - View email verification status

## API Endpoints

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login user |
| POST | `/api/auth/forgot-password/` | Request password reset |
| POST | `/api/auth/reset-password/` | Reset password with token |
| POST | `/api/auth/send-verification-email/` | Send email verification |
| POST | `/api/auth/verify-email/` | Verify email with token |

### Protected Endpoints (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/profile/` | Get user profile |
| PUT | `/api/auth/profile/` | Update user profile |
| POST | `/api/auth/change-password/` | Change password |

## Features in Detail

### 🔐 User Registration

**Endpoint:** `POST /api/auth/register/`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123",
  "phone": "1234567890",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "email_verified": false,
    "is_admin": false
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 🔑 User Login

**Endpoint:** `POST /api/auth/login/`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "email_verified": true,
    "is_admin": false
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### ✉️ Email Verification

**Send Verification Email:**  
`POST /api/auth/send-verification-email/`

**Verify Email:**  
`POST /api/auth/verify-email/`

```json
{
  "uid": "base64_encoded_user_id",
  "token": "verification_token"
}
```

### 🔄 Password Reset

**Request Reset:**  
`POST /api/auth/forgot-password/`

```json
{
  "email": "john@example.com"
}
```

**Reset Password:**  
`POST /api/auth/reset-password/`

```json
{
  "uid": "base64_encoded_user_id",
  "token": "reset_token",
  "password": "newpassword123"
}
```

### 🔒 Change Password

**Endpoint:** `POST /api/auth/change-password/`  
**Authentication:** Required

```json
{
  "old_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

### 👤 Profile Management

**Get Profile:**  
`GET /api/auth/profile/`  
**Authentication:** Required

**Update Profile:**  
`PUT /api/auth/profile/`  
**Authentication:** Required

```json
{
  "username": "john_doe_updated",
  "phone": "0987654321",
  "address": "456 New St"
}
```

## Security Features

- ✅ **Password Hashing:** PBKDF2-SHA256 with Django
- ✅ **JWT Tokens:** 60-minute access, 7-day refresh
- ✅ **Token Expiry:** Password reset/verification links expire in 24 hours
- ✅ **Rate Limiting:** Login (5/min), Register (3/min)
- ✅ **Email Enumeration Prevention:** Same response for existing/non-existing emails
- ✅ **HTTPS Ready:** Secure headers enabled in production
- ✅ **CORS Protection:** Whitelisted domains only

## Email Configuration

### Development (Console Backend)

Emails are printed to console. No configuration needed.

### Production (SMTP)

Set these environment variables in `.env`:

```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@easycart.com
FRONTEND_URL=https://yourdomain.com
```

## Testing

### Backend Tests

```bash
cd backend
python manage.py test tests.test_authentication
```

### Frontend Tests

```bash
cd frontend
npm test -- Authentication.test.js
```

## Troubleshooting

### Emails not sending

1. Check `EMAIL_BACKEND` in settings
2. Verify SMTP credentials in `.env`
3. Check Django console for errors
4. Test with: `python manage.py shell` → `from django.core.mail import send_mail`

### Token expired

- Tokens expire after 24 hours for security
- Request a new reset/verification email

### Can't login after password change

- Clear browser cache/cookies
- Try incognito mode
- Verify new password is correct

### Email verification not working

- Check spam folder
- Verify `FRONTEND_URL` in `.env`
- In development, check console for verification URL

## Future Enhancements (Optional)

- [ ] OAuth providers (Google, Facebook, GitHub)
- [ ] Two-factor authentication (2FA)
- [ ] Account deletion
- [ ] Login history/sessions management
- [ ] Avatar upload
- [ ] Email preferences

## Support

For detailed configuration, see [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)

For issues:
1. Check Django logs: `python manage.py runserver` output
2. Check browser console for frontend errors
3. Verify environment variables are set correctly
4. Test API endpoints with Postman/curl

## Related Files

- Backend: `backend/apps/accounts/`
- Frontend: `frontend/src/pages/` (Login.js, Register.js, Profile.js, etc.)
- Tests: `backend/tests/test_authentication.py`, `frontend/src/__tests__/Authentication.test.js`
- Configuration: `backend/ecommerce/settings.py`
- Documentation: `AUTHENTICATION_GUIDE.md`
