from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from django_ratelimit.decorators import ratelimit
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.html import escape
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.http import Http404
from rest_framework.exceptions import PermissionDenied
import re
import os
from .models import User
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from .permissions import IsSuperAdmin, IsAdminUser
from .validators import validate_phone_number, PHONE_PATTERN
from rest_framework import generics, permissions

# --- Customer Management API Views ---
from .models import User
from .serializers import UserSerializer


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
            raise PermissionDenied(
                "You do not have permission to access this user."
            )

        return obj


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate="3/h", method="POST", block=True)
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
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate="5/m", method="POST", block=True)
def login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH"])
def profile(request):
    """
    Get or update user profile with enhanced validation.
    """
    if request.method == "GET":
        return Response(UserSerializer(request.user).data)
    
    elif request.method in ["PUT", "PATCH"]:
        # Don't allow sensitive fields to be updated via this endpoint
        data = request.data.copy()
        
        # Remove fields that shouldn't be updated here
        sensitive_fields = ['is_admin', 'is_staff', 'is_superuser', 'role', 'email']
        for field in sensitive_fields:
            data.pop(field, None)
        
        # Validate and sanitize inputs
        if 'phone' in data and data['phone']:
            phone = data['phone'].strip()
            is_valid, error_msg = validate_phone_number(phone)
            if not is_valid:
                return Response(
                    {"phone": [error_msg]},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if 'address' in data and data['address']:
            # Sanitize address
            raw_address = str(data['address'])[:500]
            clean_address = re.sub(r'[.]{2,}|[/\\]|%2e|%2f|%5c|%00', '', raw_address)
            data['address'] = escape(clean_address).strip()
        
        serializer = UserSerializer(request.user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
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
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # In production, send actual email with reset link
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
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
def reset_password(request):
    uid = request.data.get("uid", "").strip()
    token = request.data.get("token", "").strip()
    password = request.data.get("password", "")

    if not all([uid, token, password]):
        return Response(
            {"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Validate password strength
    if len(password) < 8:
        return Response(
            {"error": "Password must be at least 8 characters"},
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


@api_view(["POST"])
def change_password(request):
    """
    Allow authenticated users to change their password.
    """
    from django.contrib.auth.password_validation import validate_password as django_validate_password
    from django.core.exceptions import ValidationError as DjangoValidationError
    
    current_password = request.data.get("current_password", "")
    new_password = request.data.get("new_password", "")
    confirm_password = request.data.get("confirm_password", "")

    # Validate all fields are present
    if not all([current_password, new_password, confirm_password]):
        return Response(
            {"error": "All fields are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify current password
    if not request.user.check_password(current_password):
        return Response(
            {"error": "Current password is incorrect"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify new passwords match
    if new_password != confirm_password:
        return Response(
            {"error": "New passwords do not match"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate password strength
    try:
        django_validate_password(new_password, request.user)
    except DjangoValidationError as e:
        return Response(
            {"error": list(e.messages)},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Change password
    request.user.set_password(new_password)
    request.user.save()

    return Response(
        {"message": "Password changed successfully"},
        status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsSuperAdmin])
def django_admin_access(request):
    """
    Provide access to Django admin interface for superadmin users.
    Returns admin URL and session info.
    """
    from django.conf import settings
    from django.contrib.sessions.models import Session
    from django.contrib.auth import login
    import datetime

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
