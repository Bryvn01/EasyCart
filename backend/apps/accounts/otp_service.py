"""
OTP Service for Customer Authentication
Supports SMS (Africa's Talking), WhatsApp, and Email delivery
"""

import random
import logging
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from decouple import config

logger = logging.getLogger(__name__)

# Twilio Configuration
try:
    from twilio.rest import Client

    TWILIO_ACCOUNT_SID = config("TWILIO_ACCOUNT_SID", default="")
    TWILIO_AUTH_TOKEN = config("TWILIO_AUTH_TOKEN", default="")
    TWILIO_PHONE_NUMBER = config("TWILIO_PHONE_NUMBER", default="")

    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    else:
        twilio_client = None
        logger.warning("Twilio not configured - SMS/WhatsApp disabled")
except ImportError:
    twilio_client = None
    logger.warning("twilio package not installed")


def generate_otp():
    """Generate 6-digit OTP code"""
    return str(random.randint(100000, 999999))


def send_otp_sms(phone_number, otp_code):
    """
    Send OTP via SMS using Twilio
    Phone format: +254XXXXXXXXX (Kenya)
    """
    if not twilio_client:
        logger.warning("Twilio not configured - using console logging")
        print(f"\n📱 [DEV] SMS OTP to {phone_number}: {otp_code}\n")
        return True

    try:
        # Ensure phone number has country code
        if not phone_number.startswith("+"):
            phone_number = f'+254{phone_number.lstrip("0")}'

        message_body = (
            f"Your EasyCart verification code is: {otp_code}\nValid for 10 minutes."
        )

        message = twilio_client.messages.create(
            body=message_body, from_=TWILIO_PHONE_NUMBER, to=phone_number
        )
        logger.info(f"SMS sent to {phone_number}: {message.sid}")
        return True
    except Exception as e:
        logger.error(f"SMS send failed: {str(e)}")
        return False


def send_otp_whatsapp(phone_number, otp_code):
    """
    Send OTP via WhatsApp using Twilio
    Note: Requires WhatsApp Business API setup
    """
    if not twilio_client:
        logger.error("WhatsApp service not configured")
        return False

    try:
        # Ensure phone number has country code
        if not phone_number.startswith("+"):
            phone_number = f'+254{phone_number.lstrip("0")}'

        message_body = (
            f"Your EasyCart verification code is: {otp_code}\nValid for 10 minutes."
        )

        # Twilio WhatsApp format: whatsapp:+1234567890
        # Use sandbox number for testing or approved sender for production
        whatsapp_from = config(
            "TWILIO_WHATSAPP_FROM", default=f"whatsapp:{TWILIO_PHONE_NUMBER}"
        )

        message = twilio_client.messages.create(
            body=message_body, from_=whatsapp_from, to=f"whatsapp:{phone_number}"
        )
        logger.info(f"WhatsApp sent to {phone_number}: {message.sid}")
        return True
    except Exception as e:
        logger.error(f"WhatsApp send failed: {str(e)}")
        return False


def send_otp_email(email, otp_code):
    """Send OTP via Email as fallback"""
    try:
        # Skip temp emails (created for phone-only users)
        if email.endswith("@easycart.temp"):
            logger.warning(f"Skipping OTP email to temp address: {email}")
            return False

        # Check if email is configured
        if not settings.EMAIL_HOST:
            logger.warning(
                "Email not configured - using console logging for development"
            )
            print(f"\n📧 [DEV] Email OTP to {email}: {otp_code}\n")
            return True

        subject = "EasyCart - Your Verification Code"
        message = f"""
Hello,

Your EasyCart verification code is: {otp_code}

This code is valid for 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
EasyCart Team
        """

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        logger.info(f"Email OTP sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Email send failed: {str(e)}")
        # In development, still return True if console backend is used
        if "console" in settings.EMAIL_BACKEND.lower():
            logger.info(f"Console email backend - OTP logged: {otp_code}")
            print(f"\n📧 [DEV] Email OTP to {email}: {otp_code}\n")
            return True
        return False


def validate_phone_number(phone):
    """
    Validate and normalize Kenyan phone number
    Accepts: 0712345678, 712345678, 254712345678, +254712345678
    Returns: +254712345678 or None if invalid
    """
    import re

    # Remove spaces, dashes, parentheses
    phone = re.sub(r"[\s\-\(\)]", "", str(phone))

    # Remove leading + if present
    phone = phone.lstrip("+")

    # Handle different formats
    if phone.startswith("254"):
        phone = phone[3:]  # Remove 254 prefix
    elif phone.startswith("0"):
        phone = phone[1:]  # Remove leading 0

    # Check if valid Kenyan mobile number (9 digits starting with 7 or 1)
    if re.match(r"^[71]\d{8}$", phone):
        return f"+254{phone}"

    logger.warning(f"Invalid phone number format: {phone}")
    return None


def verify_otp(user, otp_code):
    """
    Verify OTP code with attempt tracking and security measures
    Returns: (is_valid, message, attempts_remaining)
    """
    MAX_ATTEMPTS = 5
    BLOCK_DURATION = timedelta(minutes=15)

    # Check if user is blocked
    if user.otp_blocked_until and timezone.now() < user.otp_blocked_until:
        time_remaining = (user.otp_blocked_until - timezone.now()).seconds // 60
        return (
            False,
            f"Too many failed attempts. Try again in {time_remaining} minutes.",
            0,
        )

    if not user.otp_code:
        return False, "No OTP code found. Please request a new one.", 0

    if user.otp_verified:
        return False, "OTP already verified. Please request a new one.", 0

    # Check expiration (10 minutes)
    if user.otp_created_at:
        expiry_time = user.otp_created_at + timedelta(minutes=10)
        if timezone.now() > expiry_time:
            clear_otp(user)
            return False, "OTP expired. Please request a new one.", 0

    # Verify code
    if user.otp_code != otp_code:
        user.otp_attempts += 1
        user.otp_last_attempt = timezone.now()

        # Block after max attempts
        if user.otp_attempts >= MAX_ATTEMPTS:
            user.otp_blocked_until = timezone.now() + BLOCK_DURATION
            user.save()
            logger.warning(
                f"User {user.id} blocked due to {MAX_ATTEMPTS} failed OTP attempts"
            )
            return (
                False,
                f"Too many failed attempts. Account blocked for {BLOCK_DURATION.seconds // 60} minutes.",
                0,
            )

        user.save()
        attempts_remaining = MAX_ATTEMPTS - user.otp_attempts
        logger.info(
            f"Failed OTP attempt for user {user.id}. Attempts remaining: {attempts_remaining}"
        )
        return (
            False,
            f"Invalid OTP code. {attempts_remaining} attempts remaining.",
            attempts_remaining,
        )

    # Mark as verified
    user.otp_verified = True
    user.otp_attempts = 0
    user.otp_blocked_until = None
    user.save()
    logger.info(f"OTP verified successfully for user {user.id}")

    return True, "OTP verified successfully.", MAX_ATTEMPTS


def clear_otp(user):
    """Clear OTP data after successful verification"""
    user.otp_code = None
    user.otp_created_at = None
    user.otp_verified = False
    user.save()
