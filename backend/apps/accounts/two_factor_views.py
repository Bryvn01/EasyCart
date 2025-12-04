from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .two_factor import (
    generate_totp_secret,
    get_totp_uri,
    generate_qr_code,
    verify_totp,
)
import logging

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def setup_2fa(request):
    """Generate 2FA secret and QR code"""
    user = request.user

    # Only allow admins to enable 2FA
    if not (user.is_admin or user.is_superuser or user.is_staff):
        return Response(
            {"error": "2FA is only available for admin users"},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Generate new secret
    secret = generate_totp_secret()
    uri = get_totp_uri(user, secret)
    qr_code = generate_qr_code(uri)

    # Save secret but don't enable yet (user must verify first)
    user.two_factor_secret = secret
    user.save()

    logger.info(f"2FA setup initiated for user {user.email}")

    return Response(
        {
            "secret": secret,
            "qr_code": f"data:image/png;base64,{qr_code}",
            "message": "Scan QR code with authenticator app and verify to enable 2FA",
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def enable_2fa(request):
    """Enable 2FA after verifying token"""
    user = request.user
    token = request.data.get("token")

    if not token:
        return Response(
            {"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    if not user.two_factor_secret:
        return Response(
            {"error": "Please setup 2FA first"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Verify token
    if verify_totp(user.two_factor_secret, token):
        user.two_factor_enabled = True
        user.save()
        logger.info(f"2FA enabled for user {user.email}")
        return Response({"message": "2FA enabled successfully"})
    else:
        return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def disable_2fa(request):
    """Disable 2FA"""
    user = request.user
    token = request.data.get("token")

    if not token:
        return Response(
            {"error": "Token is required to disable 2FA"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Verify token before disabling
    if user.two_factor_enabled and verify_totp(user.two_factor_secret, token):
        user.two_factor_enabled = False
        user.two_factor_secret = None
        user.save()
        logger.info(f"2FA disabled for user {user.email}")
        return Response({"message": "2FA disabled successfully"})
    else:
        return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def verify_2fa(request):
    """Verify 2FA token during login"""
    email = request.data.get("email")
    token = request.data.get("token")

    if not email or not token:
        return Response(
            {"error": "Email and token are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        from .models import User

        user = User.objects.get(email=email)

        if not user.two_factor_enabled:
            return Response(
                {"error": "2FA not enabled for this user"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if verify_totp(user.two_factor_secret, token):
            return Response({"verified": True})
        else:
            return Response(
                {"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST
            )
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_2fa_status(request):
    """Get 2FA status for current user"""
    user = request.user
    return Response(
        {
            "enabled": user.two_factor_enabled,
            "is_admin": user.is_admin or user.is_superuser or user.is_staff,
        }
    )
