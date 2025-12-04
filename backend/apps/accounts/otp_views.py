"""
OTP Authentication Views for Customer Login/Registration
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from .otp_service import (
    generate_otp,
    send_otp_sms,
    send_otp_whatsapp,
    send_otp_email,
    verify_otp,
    clear_otp,
)
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([AllowAny])
def request_otp(request):
    """
    Request OTP for login/registration
    Body: { "identifier": "email or phone", "method": "sms|whatsapp|email" }
    """
    identifier = request.data.get("identifier", "").strip()
    method = request.data.get("method", "sms").lower()

    if not identifier:
        return Response(
            {"error": "Email or phone number is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Determine if identifier is email or phone
    is_email = "@" in identifier

    try:
        # Find or create user
        if is_email:
            user, created = User.objects.get_or_create(
                email=identifier, defaults={"username": identifier.split("@")[0]}
            )
        else:
            # Phone number - normalize format
            phone = identifier.lstrip("+").lstrip("254").lstrip("0")
            phone_normalized = f"+254{phone}"

            user, created = User.objects.get_or_create(
                phone_number=phone_normalized,
                defaults={
                    "username": f"user_{phone}",
                    "email": f"{phone}@easycart.temp",
                },
            )

        # Generate OTP
        otp_code = generate_otp()
        user.otp_code = otp_code
        user.otp_created_at = timezone.now()
        user.otp_verified = False
        user.save()

        # Send OTP based on method with fallback to email
        success = False
        attempted_method = method

        if method == "sms" and user.phone_number:
            success = send_otp_sms(user.phone_number, otp_code)
        elif method == "whatsapp" and user.phone_number:
            success = send_otp_whatsapp(user.phone_number, otp_code)
        elif method == "email" or is_email:
            success = send_otp_email(user.email, otp_code)

        # Fallback to email if primary method fails
        if not success and method != "email":
            logger.warning(f"{method.upper()} failed, falling back to email")
            if user.email and not user.email.endswith("@easycart.temp"):
                success = send_otp_email(user.email, otp_code)
                if success:
                    attempted_method = "email"

        if success:
            return Response(
                {
                    "message": f"OTP sent via {attempted_method}",
                    "identifier": identifier,
                    "is_new_user": created,
                    "expires_in": 600,  # 10 minutes
                }
            )
        else:
            return Response(
                {
                    "error": f"Failed to send OTP via {method}. Please try another method."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    except Exception as e:
        logger.error(f"OTP request error: {str(e)}")
        return Response(
            {"error": "Failed to process OTP request"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp_login(request):
    """
    Verify OTP and login user
    Body: { "identifier": "email or phone", "otp_code": "123456" }
    """
    identifier = request.data.get("identifier", "").strip()
    otp_code = request.data.get("otp_code", "").strip()

    if not identifier or not otp_code:
        return Response(
            {"error": "Identifier and OTP code are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Find user
        is_email = "@" in identifier
        if is_email:
            user = User.objects.get(email=identifier)
        else:
            phone = identifier.lstrip("+").lstrip("254").lstrip("0")
            phone_normalized = f"+254{phone}"
            user = User.objects.get(phone_number=phone_normalized)

        # Verify OTP
        is_valid, message = verify_otp(user, otp_code)

        if not is_valid:
            return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # Clear OTP after successful login
        clear_otp(user)

        # Check if profile is complete
        is_profile_complete = bool(user.first_name and user.last_name)

        return Response(
            {
                "message": "Login successful",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "phone_number": user.phone_number,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
                "is_profile_complete": is_profile_complete,
            }
        )

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"OTP verification error: {str(e)}")
        return Response(
            {"error": "Failed to verify OTP"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def resend_otp(request):
    """
    Resend OTP
    Body: { "identifier": "email or phone", "method": "sms|whatsapp|email" }
    """
    return request_otp(request)
