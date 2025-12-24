"""
Email Verification Service
Handles email verification token generation, sending, and validation
"""

import secrets
import hashlib
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


def generate_verification_token():
    """
    Generate a secure random token for email verification
    Returns 32-character hex string
    """
    return secrets.token_hex(32)


def send_verification_email(user, request=None):
    """
    Send email verification link to user

    Args:
        user: User model instance
        request: HTTP request object (optional, for building absolute URL)

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Generate new token
        token = generate_verification_token()
        user.email_verification_token = token
        user.email_verification_sent_at = timezone.now()
        user.save(
            update_fields=["email_verification_token", "email_verification_sent_at"]
        )

        # Build verification URL
        if request:
            domain = request.get_host()
            protocol = "https" if request.is_secure() else "http"
        else:
            domain = settings.FRONTEND_URL.replace("http://", "").replace(
                "https://", ""
            )
            protocol = "https" if "https" in settings.FRONTEND_URL else "http"

        verification_url = f"{protocol}://{domain}/verify-email?token={token}"

        # Prepare email content
        context = {
            "user": user,
            "verification_url": verification_url,
            "expiry_hours": 24,
        }

        # Try to use HTML template if available, otherwise plain text
        try:
            html_message = render_to_string("emails/verify_email.html", context)
            plain_message = strip_tags(html_message)
        except:
            # Fallback to simple plain text
            plain_message = f"""
Hi {user.preferred_username or user.username},

Thank you for registering with EasyCart!

Please verify your email address by clicking the link below:
{verification_url}

This link will expire in 24 hours.

If you didn't create an account with EasyCart, please ignore this email.

Best regards,
EasyCart Security Team
            """.strip()
            html_message = None

        # Send email
        send_mail(
            subject="Verify your EasyCart email address",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )

        logger.info(
            f"Verification email sent to {user.email[:3]}***@{user.email.split('@')[1]}"
        )
        return True

    except Exception as e:
        logger.error(f"Failed to send verification email to {user.email}: {e}")
        return False


def verify_email_token(token):
    """
    Verify email verification token

    Args:
        token: Verification token string

    Returns:
        tuple: (success: bool, message: str, user: User or None)
    """
    from apps.accounts.models import User

    try:
        # Find user with this token
        user = User.objects.filter(email_verification_token=token).first()

        if not user:
            return False, "Invalid or expired verification token", None

        # Check if already verified
        if user.email_verified:
            return False, "Email already verified", user

        # Check token expiry (24 hours)
        if user.email_verification_sent_at:
            expiry_time = user.email_verification_sent_at + timedelta(hours=24)
            if timezone.now() > expiry_time:
                # Clear expired token
                user.email_verification_token = None
                user.email_verification_sent_at = None
                user.save(
                    update_fields=[
                        "email_verification_token",
                        "email_verification_sent_at",
                    ]
                )
                return (
                    False,
                    "Verification token expired. Please request a new one.",
                    None,
                )

        # Verify email
        user.email_verified = True
        user.email_verification_token = None
        user.email_verification_sent_at = None
        user.save(
            update_fields=[
                "email_verified",
                "email_verification_token",
                "email_verification_sent_at",
            ]
        )

        logger.info(f"Email verified successfully for user {user.id}")
        return True, "Email verified successfully!", user

    except Exception as e:
        logger.error(f"Error verifying email token: {e}")
        return False, "An error occurred during verification", None


def resend_verification_email(user, request=None):
    """
    Resend verification email with rate limiting

    Args:
        user: User model instance
        request: HTTP request object (optional)

    Returns:
        tuple: (success: bool, message: str)
    """
    # Check if already verified
    if user.email_verified:
        return False, "Email already verified"

    # Rate limiting: Allow resend only after 5 minutes
    if user.email_verification_sent_at:
        time_since_last = timezone.now() - user.email_verification_sent_at
        if time_since_last < timedelta(minutes=5):
            remaining = 5 - int(time_since_last.total_seconds() / 60)
            return (
                False,
                f"Please wait {remaining} minute(s) before requesting another verification email",
            )

    # Send email
    success = send_verification_email(user, request)

    if success:
        return True, "Verification email sent successfully"
    else:
        return False, "Failed to send verification email. Please try again later."


def require_email_verification(user):
    """
    Check if user needs email verification for certain actions

    Args:
        user: User model instance

    Returns:
        bool: True if email verification is required, False otherwise
    """
    # For now, we'll make it a soft requirement
    # Can be enforced later for sensitive operations
    return not user.email_verified


def get_verification_status(user):
    """
    Get detailed verification status for user

    Args:
        user: User model instance

    Returns:
        dict: Verification status details
    """
    status = {
        "email_verified": user.email_verified,
        "verification_sent_at": user.email_verification_sent_at,
        "email": user.email,
        "can_resend": True,  # Default to True (user can always send if not yet sent)
        "time_until_resend": 0,
    }

    if not user.email_verified and user.email_verification_sent_at:
        time_since_last = timezone.now() - user.email_verification_sent_at
        if time_since_last >= timedelta(minutes=5):
            status["can_resend"] = True
        else:
            status["can_resend"] = False  # Must wait if recently sent
            status["time_until_resend"] = 5 - int(time_since_last.total_seconds() / 60)

    return status
