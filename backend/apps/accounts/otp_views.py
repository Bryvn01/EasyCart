"""
OTP Authentication Views for Customer Login/Registration
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
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
    validate_phone_number,
)
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class OTPRequestThrottle(AnonRateThrottle):
    """Custom throttle: 5 OTP requests per hour per IP"""

    rate = "5/hour"


class OTPVerifyThrottle(AnonRateThrottle):
    """Custom throttle: 10 verification attempts per hour per IP"""

    rate = "10/hour"


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([OTPRequestThrottle])
def request_otp(request):
    """
    Request OTP for login/registration with rate limiting and cooldown
    Body: { "identifier": "email or phone", "method": "sms|whatsapp|email" }
    """
    identifier = request.data.get("identifier", "").strip()
    method = request.data.get("method", "email").lower()

    # Get client IP for logging
    client_ip = request.META.get(
        "HTTP_X_FORWARDED_FOR", request.META.get("REMOTE_ADDR", "unknown")
    )
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    if not identifier:
        logger.warning(f"OTP request without identifier from IP: {client_ip}")
        return Response(
            {"error": "Email or phone number is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Determine if identifier is email or phone
    is_email = "@" in identifier

    try:
        # Find or create user
        if is_email:
            # Validate email format
            if (
                not identifier
                or "@" not in identifier
                or "." not in identifier.split("@")[1]
            ):
                logger.warning(
                    f"Invalid email format from IP {client_ip}: {identifier}"
                )
                return Response(
                    {"error": "Invalid email format"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user, created = User.objects.get_or_create(
                email=identifier, defaults={"username": identifier.split("@")[0]}
            )
        else:
            # Phone number - validate and normalize format
            phone_normalized = validate_phone_number(identifier)

            if not phone_normalized:
                logger.warning(
                    f"Invalid phone number from IP {client_ip}: {identifier}"
                )
                return Response(
                    {
                        "error": "Invalid phone number. Use format: 0712345678 or +254712345678"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user, created = User.objects.get_or_create(
                phone_number=phone_normalized,
                defaults={
                    "username": f"user_{phone_normalized[4:]}",
                    "email": f"{phone_normalized[4:]}@easycart.temp",
                },
            )

        # Check cooldown period (prevent spam - 1 minute between requests)
        COOLDOWN_SECONDS = 60
        if user.otp_created_at:
            time_since_last = (timezone.now() - user.otp_created_at).total_seconds()
            if time_since_last < COOLDOWN_SECONDS:
                wait_time = int(COOLDOWN_SECONDS - time_since_last)
                logger.warning(
                    f"OTP cooldown active for user {user.id} from IP {client_ip}"
                )
                return Response(
                    {
                        "error": f"Please wait {wait_time} seconds before requesting another OTP",
                        "retry_after": wait_time,
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
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
            logger.info(
                f"OTP sent to user {user.id} via {attempted_method} from IP {client_ip}"
            )
            return Response(
                {
                    "message": f"OTP sent via {attempted_method}",
                    "identifier": identifier,
                    "is_new_user": created,
                    "expires_in": 600,  # 10 minutes
                    "can_resend_after": 60,  # 1 minute cooldown
                }
            )
        else:
            logger.error(
                f"Failed to send OTP to user {user.id} via {method} from IP {client_ip}"
            )
            return Response(
                {
                    "error": f"Failed to send OTP via {method}. Please try another method."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    except Exception as e:
        logger.error(f"OTP request error: {str(e)}", exc_info=True)

        # Check if it's a database connection error
        error_msg = str(e).lower()
        if any(
            keyword in error_msg for keyword in ["connection", "database", "postgres"]
        ):
            return Response(
                {
                    "error": "Database temporarily unavailable",
                    "message": "Please try again in a moment",
                    "retry": True,
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {"error": "Failed to process OTP request", "detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([OTPVerifyThrottle])
def verify_otp_login(request):
    """
    Verify OTP and login user with attempt tracking
    Body: { "identifier": "email or phone", "otp_code": "123456" }
    """
    identifier = request.data.get("identifier", "").strip()
    otp_code = request.data.get("otp_code", "").strip()

    # Get client IP for logging
    client_ip = request.META.get(
        "HTTP_X_FORWARDED_FOR", request.META.get("REMOTE_ADDR", "unknown")
    )
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    if not identifier or not otp_code:
        logger.warning(
            f"OTP verification attempt without credentials from IP: {client_ip}"
        )
        return Response(
            {"error": "Identifier and OTP code are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate OTP format (6 digits)
    if not otp_code.isdigit() or len(otp_code) != 6:
        logger.warning(f"Invalid OTP format from IP {client_ip}")
        return Response(
            {"error": "OTP code must be 6 digits"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Find user
        is_email = "@" in identifier
        if is_email:
            user = User.objects.get(email=identifier)
        else:
            phone_normalized = validate_phone_number(identifier)
            if not phone_normalized:
                logger.warning(
                    f"Invalid phone number in verification from IP {client_ip}: {identifier}"
                )
                return Response(
                    {"error": "Invalid phone number format"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user = User.objects.get(phone_number=phone_normalized)

        # Verify OTP with attempt tracking
        is_valid, message, attempts_remaining = verify_otp(user, otp_code)

        if not is_valid:
            logger.warning(
                f"Failed OTP verification for user {user.id} from IP {client_ip}: {message}"
            )
            return Response(
                {"error": message, "attempts_remaining": attempts_remaining},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # Clear OTP after successful login
        clear_otp(user)

        # Check if profile is complete
        is_profile_complete = bool(user.first_name and user.last_name)

        logger.info(f"Successful OTP login for user {user.id} from IP {client_ip}")

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
        logger.warning(
            f"OTP verification attempt for non-existent user from IP {client_ip}: {identifier}"
        )
        # Generic error to prevent user enumeration
        return Response(
            {"error": "Invalid credentials or OTP expired"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        logger.error(
            f"OTP verification error from IP {client_ip}: {str(e)}", exc_info=True
        )
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
