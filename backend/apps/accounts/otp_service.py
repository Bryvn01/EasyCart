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
        return False


def verify_otp(user, otp_code):
    """
    Verify OTP code
    Returns: (is_valid, message)
    """
    if not user.otp_code:
        return False, "No OTP code found. Please request a new one."

    if user.otp_verified:
        return False, "OTP already verified. Please request a new one."

    # Check expiration (10 minutes)
    if user.otp_created_at:
        expiry_time = user.otp_created_at + timedelta(minutes=10)
        if timezone.now() > expiry_time:
            return False, "OTP expired. Please request a new one."

    # Verify code
    if user.otp_code != otp_code:
        return False, "Invalid OTP code."

    # Mark as verified
    user.otp_verified = True
    user.save()

    return True, "OTP verified successfully."


def clear_otp(user):
    """Clear OTP data after successful verification"""
    user.otp_code = None
    user.otp_created_at = None
    user.otp_verified = False
    user.save()
