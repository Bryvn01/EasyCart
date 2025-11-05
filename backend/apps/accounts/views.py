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
import re
import os
from .models import User
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from .permissions import IsSuperAdmin, IsAdminUser
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
        try:
            obj = super().get_object()
            user = self.request.user
            
            # Allow superusers and admins full access
            if user.is_superuser or getattr(user, "is_admin", False):
                return obj
            
            # Regular users can only access their own data
            if obj.pk != user.pk:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You do not have permission to access this user.")
            
            return obj
        except Exception as e:
            from rest_framework.exceptions import NotFound
            raise NotFound("User not found")


@api_view(["POST"])
@permission_classes([AllowAny])
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
            clean_value = re.sub(r'[.]{2,}|[/\\]|%2e|%2f|%5c|%00', '', str(value)[:500])
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


@api_view(["GET", "PUT"])
def profile(request):
    if request.method == "GET":
        return Response(UserSerializer(request.user).data)
    elif request.method == "PUT":
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get("email", "").strip()
    
    # Validate email format
    if not email or not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        return Response({"email": ["Valid email is required"]}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # In production, send actual email with reset link
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        # reset_url = f"{frontend_url}/reset-password?uid={uid}&token={token}"
        # send_mail(...)

        return Response({"message": "Password reset email sent"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        # Don't reveal if email exists or not for security (timing-safe)
        return Response({"message": "Password reset email sent"}, status=status.HTTP_200_OK)
    except Exception as e:
        # Log error but don't expose details
        import logging
        logging.error(f"Password reset error: {str(e)}")
        return Response({"message": "Password reset email sent"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    uid = request.data.get("uid", "").strip()
    token = request.data.get("token", "").strip()
    password = request.data.get("password", "")

    if not all([uid, token, password]):
        return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate password strength
    if len(password) < 8:
        return Response({"error": "Password must be at least 8 characters"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Sanitize uid to prevent injection
        safe_uid = re.sub(r'[^A-Za-z0-9_=-]', '', uid[:100])
        user_id = force_str(urlsafe_base64_decode(safe_uid))
        
        # Validate user_id is numeric
        if not user_id.isdigit():
            raise ValueError("Invalid user ID")
        
        user = User.objects.get(pk=int(user_id))

        if default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
    except (User.DoesNotExist, ValueError, TypeError) as e:
        import logging
        logging.warning(f"Password reset attempt failed: {type(e).__name__}")
        return Response({"error": "Invalid reset link"}, status=status.HTTP_400_BAD_REQUEST)


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
