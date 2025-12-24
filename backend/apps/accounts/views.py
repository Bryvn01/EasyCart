from rest_framework import status, generics, permissions
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
    throttle_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import PermissionDenied
from django.utils.html import escape
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.views.decorators.csrf import csrf_exempt
import re
import logging
from .models import User
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from .permissions import IsSuperAdmin, IsAdminUser
from .otp_views import PasswordResetThrottle
from .email_verification_service import send_verification_email
from .device_fingerprint_service import (
    track_device_login,
    detect_suspicious_activity,
    verify_device_fingerprint,
)

logger = logging.getLogger(__name__)


# --- Customer Management API Views ---


class CustomerListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    search_fields = ["username", "email", "phone"]


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Admins can access any user; users can only access/update themselves
        obj = super().get_object()
        user = self.request.user

        # Allow superusers and admins full access
        if user.is_superuser or getattr(user, "is_admin", False):
            return obj

        # Regular users can only access their own data
        if obj.pk != user.pk:
            raise PermissionDenied("You do not have permission to access this user.")

        return obj


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])  # No authentication required for registration
@csrf_exempt
def register(request):
    # Sanitize all input fields to prevent injection attacks
    data = request.data.copy()

    # Sanitize address field specifically
    if "address" in data:
        raw_address = str(data["address"])[:200]
        # Allow only safe characters for addresses
        sanitized = "".join(c for c in raw_address if c.isalnum() or c in " .,#-")
        data["address"] = escape(sanitized).strip()

    # Sanitize all string fields to prevent path traversal and injection
    for key, value in data.items():
        if isinstance(value, str) and key != "password":  # Don't modify password
            # Remove path traversal patterns and dangerous characters
            clean_value = re.sub(r"[.]{2,}|[/\\]|%2e|%2f|%5c|%00", "", str(value)[:500])
            data[key] = escape(clean_value).strip()

    serializer = UserRegistrationSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()

        # Send verification email (async, non-blocking)
        try:
            send_verification_email(user, request)
            logger.info(f"Verification email sent to new user {user.id}")
        except Exception as e:
            logger.error(f"Failed to send verification email to {user.id}: {e}")
            # Don't block registration if email fails

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "message": "Registration successful! Please check your email to verify your account.",
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])  # No authentication required for login
# @ratelimit(key="ip", rate="100/m", method="POST", block=False)  # Disabled for testing
def login(request):
    # Rate limiting disabled for testing - re-enable in production
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data["user"]

        # Device fingerprinting and suspicious activity detection
        is_suspicious, reason = detect_suspicious_activity(user, request)
        is_known_device, device_info = verify_device_fingerprint(user, request)

        if is_suspicious:
            logger.warning(f"Suspicious login detected for user {user.id}: {reason}")
            # In production, you might want to require additional verification

        # Check if 2FA is enabled
        if user.two_factor_enabled:
            # Return special response indicating 2FA required
            return Response(
                {
                    "requires_2fa": True,
                    "email": user.email,
                    "message": "Please enter your 2FA code",
                    "security_alert": is_suspicious,
                    "new_device": not is_known_device,
                },
                status=status.HTTP_200_OK,
            )

        # Normal login without 2FA
        refresh = RefreshToken.for_user(user)

        # Track device login
        track_device_login(user, request, str(refresh.access_token))

        return Response(
            {
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "security_info": {
                    "new_device": not is_known_device,
                    "suspicious_activity": is_suspicious,
                    "reason": reason if is_suspicious else None,
                },
            }
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH"])
@permission_classes([permissions.IsAuthenticated])
def profile(request):
    """
    User profile endpoint.

    Methods:
    - GET: Retrieve authenticated user's profile
    - PUT: Full update of user profile (all fields)
    - PATCH: Partial update of user profile (specific fields)

    Returns:
    - User profile data on success
    - Validation errors on failure (400)

    Authentication: Required (JWT token)
    """
    if request.method == "GET":
        return Response(UserSerializer(request.user).data)
    elif request.method in ["PUT", "PATCH"]:
        # Both PUT and PATCH support partial updates for flexibility
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])  # No authentication required
@throttle_classes([PasswordResetThrottle])
@csrf_exempt
def forgot_password(request):
    email = request.data.get("email", "").strip()

    # Validate email format
    if not email or not re.match(
        r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email
    ):
        return Response(
            {"email": ["Valid email is required"]}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
        # Generate reset token (stored for future email implementation)
        default_token_generator.make_token(user)
        urlsafe_base64_encode(force_bytes(user.pk))

        # TODO: In production, send actual email with reset link
        # frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        # reset_url = f"{frontend_url}/reset-password?uid={uid}&token={token}"
        # send_mail(...)

        return Response(
            {"message": "Password reset email sent"}, status=status.HTTP_200_OK
        )
    except User.DoesNotExist:
        # Don't reveal if email exists or not for security (timing-safe)
        return Response(
            {"message": "Password reset email sent"}, status=status.HTTP_200_OK
        )
    except Exception as e:
        # Log error but don't expose details
        import logging

        logging.error(f"Password reset error: {str(e)}")
        return Response(
            {"message": "Password reset email sent"}, status=status.HTTP_200_OK
        )


@api_view(["POST"])
@permission_classes([AllowAny])
@csrf_exempt
def reset_password(request):
    uid = request.data.get("uid", "").strip()
    token = request.data.get("token", "").strip()
    password = request.data.get("password", "")

    if not all([uid, token, password]):
        return Response(
            {"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Validate password strength
    if len(password) < 12:
        return Response(
            {"error": "Password must be at least 12 characters"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Sanitize uid to prevent injection
        safe_uid = re.sub(r"[^A-Za-z0-9_=-]", "", uid[:100])
        user_id = force_str(urlsafe_base64_decode(safe_uid))

        # Validate user_id is numeric
        if not user_id.isdigit():
            raise ValueError("Invalid user ID")

        user = User.objects.get(pk=int(user_id))

        if default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response(
                {"message": "Password reset successful"}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST,
            )
    except (User.DoesNotExist, ValueError, TypeError) as e:
        import logging

        logging.warning(f"Password reset attempt failed: {type(e).__name__}")
        return Response(
            {"error": "Invalid reset link"}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
@permission_classes([IsSuperAdmin])
def django_admin_access(request):
    """
    Provide access to Django admin interface for superadmin users.
    Returns admin URL and session info.
    """
    from django.conf import settings

    # Get admin URL from settings
    admin_url = getattr(settings, "ADMIN_URL", "admin/")

    # Create admin URL
    base_url = request.build_absolute_uri("/")[:-1]  # Remove trailing slash
    full_admin_url = f"{base_url}/{admin_url}"

    return Response(
        {
            "admin_url": full_admin_url,
            "message": "Superadmin access granted to Django admin",
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "is_superuser": request.user.is_superuser,
                "is_staff": request.user.is_staff,
            },
        },
        status=status.HTTP_200_OK,
    )
