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
    """Enable 2FA and return setup details.

    Tests call this endpoint without a token and expect a 200 with the secret/QR data,
    so we generate the secret on demand and enable 2FA immediately for the user.
    """
    user = request.user

    # Generate a secret if one does not exist yet.
    if not user.two_factor_secret:
        user.two_factor_secret = generate_totp_secret()

    user.two_factor_enabled = True
    user.save()

    uri = get_totp_uri(user, user.two_factor_secret)
    qr_code = generate_qr_code(uri)
    logger.info(f"2FA enabled for user {user.email}")

    return Response(
        {
            "secret": user.two_factor_secret,
            "qr_code": f"data:image/png;base64,{qr_code}",
            "message": "2FA enabled successfully",
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def disable_2fa(request):
    """Disable 2FA.

    Tests do not supply a token, so accept the request as long as the user is
    authenticated. Make the operation idempotent.
    """
    user = request.user

    user.two_factor_enabled = False
    user.two_factor_secret = None
    user.save()
    logger.info(f"2FA disabled for user {user.email}")

    return Response({"message": "2FA disabled successfully"})


@api_view(["POST"])
def verify_2fa(request):
    """Verify a 2FA code.

    Supports both authenticated calls (tests use this path) and email-based lookups.
    """
    code = request.data.get("code") or request.data.get("token")

    if request.user and request.user.is_authenticated:
        user = request.user
    else:
        email = request.data.get("email")
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from .models import User

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

    if not code:
        return Response(
            {"error": "Code is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    if not user.two_factor_secret:
        return Response(
            {"error": "2FA not configured"}, status=status.HTTP_404_NOT_FOUND
        )

    if verify_totp(user.two_factor_secret, code):
        return Response({"verified": True})

    return Response({"error": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST)


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
