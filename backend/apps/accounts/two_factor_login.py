from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer
from .two_factor import verify_totp
import logging

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_with_2fa(request):
    """Complete login after 2FA verification"""
    email = request.data.get("email")
    token = request.data.get("token")

    if not email or not token:
        return Response(
            {"error": "Email and token are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(email=email)

        if not user.two_factor_enabled:
            return Response(
                {"error": "2FA not enabled for this user"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify 2FA token
        if verify_totp(user.two_factor_secret, token):
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            logger.info(f"2FA login successful for user {user.email}")

            return Response(
                {
                    "user": UserSerializer(user).data,
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            )
        else:
            logger.warning(f"Invalid 2FA token for user {user.email}")
            return Response(
                {"error": "Invalid 2FA token"}, status=status.HTTP_400_BAD_REQUEST
            )
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
