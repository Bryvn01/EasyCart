"""
Email Verification Views
API endpoints for email verification functionality
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from .email_verification_service import (
    verify_email_token,
    resend_verification_email,
    get_verification_status,
)
import logging

logger = logging.getLogger(__name__)


class VerificationEmailThrottle(AnonRateThrottle):
    """Rate limiting for verification email requests"""

    rate = "3/hour"


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([UserRateThrottle])
def send_verification(request):
    """
    Send verification email to authenticated user

    POST /api/auth/email/send-verification/
    """
    user = request.user

    if user.email_verified:
        return Response(
            {"status": "error", "message": "Email already verified"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    success, message = resend_verification_email(user, request)

    if success:
        return Response(
            {"status": "success", "message": message}, status=status.HTTP_200_OK
        )
    else:
        return Response(
            {"status": "error", "message": message}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
@permission_classes([AllowAny])
@throttle_classes([VerificationEmailThrottle])
def verify_email(request):
    """
    Verify email using token from verification link

    GET /api/auth/email/verify/?token=<verification_token>
    """
    token = request.query_params.get("token")

    if not token:
        return Response(
            {"status": "error", "message": "Verification token is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    success, message, user = verify_email_token(token)

    if success:
        logger.info(f"Email verified for user {user.id}")
        return Response(
            {
                "status": "success",
                "message": message,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "email_verified": user.email_verified,
                },
            },
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {"status": "error", "message": message}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def verification_status(request):
    """
    Get email verification status for authenticated user

    GET /api/auth/email/status/
    """
    user = request.user
    status_info = get_verification_status(user)

    return Response(
        {"status": "success", "data": status_info}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([VerificationEmailThrottle])
def resend_verification(request):
    """
    Resend verification email (rate limited)

    POST /api/auth/email/resend-verification/
    """
    user = request.user

    success, message = resend_verification_email(user, request)

    if success:
        logger.info(f"Verification email resent to user {user.id}")
        return Response(
            {"status": "success", "message": message}, status=status.HTTP_200_OK
        )
    else:
        return Response(
            {"status": "error", "message": message},
            status=(
                status.HTTP_429_TOO_MANY_REQUESTS
                if "wait" in message.lower()
                else status.HTTP_400_BAD_REQUEST
            ),
        )
