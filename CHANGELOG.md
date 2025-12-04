# Changelog

All notable changes to EasyCart will be documented in this file.

## [2.0.0] - 2025-12-04

### Added
- **OTP Authentication System**
  - Passwordless login via SMS, WhatsApp, and Email
  - Twilio integration for SMS/WhatsApp delivery
  - 6-digit OTP codes with 10-minute expiry
  - Auto-registration for new users
  - Profile completion flow for new users

- **Two-Factor Authentication (2FA)**
  - TOTP-based 2FA for admin users
  - QR code generation for authenticator apps
  - Setup, enable, and disable 2FA functionality
  - Modified login flow with 2FA verification

- **Profile Personalization**
  - Progressive profiling for new OTP users
  - Optional profile completion page
  - Smart routing based on profile status
  - Personalized user experience

- **Admin Dashboard Improvements**
  - Fixed category ID handling in product forms
  - Improved product update functionality
  - Better error handling and validation
  - Fixed orders page customer display

### Fixed
- Cart endpoint 500 error for unauthenticated users
- Customer orders endpoint URL pattern conflicts
- Profile endpoint authentication requirement
- Admin dashboard product update 400 errors
- Category validation for numeric IDs
- Orders page showing "Unknown" for customers
- Image URL handling in product updates

### Changed
- Switched SMS provider from Africa's Talking to Twilio
- Removed WhatsApp Business API requirement (using sandbox)
- Email as default OTP delivery method
- Updated admin password to `admin123`
- Improved token management and auto-logout on 401

### Security
- Comprehensive security audit implementation
- Input validation and sanitization
- XSS protection
- CSRF token handling
- Secure token storage
- Auto-logout on unauthorized access

### Documentation
- Added OTP_AUTHENTICATION.md
- Added WHATSAPP_SETUP.md
- Added OTP_PERSONALIZATION.md
- Added EMAIL_SETUP.md
- Added TWILIO_QUICKSTART.md
- Updated README.md with latest features

## [1.0.0] - 2025-11-27

### Initial Release
- Django 5.2.7 backend with REST API
- React 18+ frontend with TailwindCSS
- PostgreSQL database
- JWT authentication
- Product catalog with categories
- Shopping cart and checkout
- Order management
- M-Pesa payment integration
- Cloudinary image storage
- Admin dashboard
- Superadmin CRUD operations
- Deployment on Render.com
