from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES, default="viewer", required=False
    )

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password",
            "password_confirm",
            "phone",
            "address",
            "role",
        )

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError("Passwords don't match")
        # Only allow role assignment if user is superadmin or manager
        request = self.context.get("request")
        if "role" in attrs:
            if request and request.user.is_authenticated:
                if request.user.role not in ["superadmin", "manager"]:
                    attrs["role"] = "viewer"
            else:
                attrs["role"] = "viewer"
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        if "role" not in validated_data:
            validated_data["role"] = "viewer"
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials")
            attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """
    User profile serializer with controlled field updates.

    Best Practice Implementation:
    - Username: Read-only (never changeable - system identity anchor)
    - Preferred Username: Editable (user-chosen display name with validation)
    - Email: Editable with validation (requires uniqueness check)
    - Phone: Editable with validation (supports OTP login)
    - Role/Admin flags: Read-only (security - only backend can modify)
    """
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "preferred_username",
            "display_name",
            "email",
            "phone",
            "address",
            "role",
            "is_admin",
            "is_staff",
            "is_superuser",
            "first_name",
            "last_name",
        )
        read_only_fields = (
            "id",
            "username",
            "display_name",
            "role",
            "is_admin",
            "is_staff",
            "is_superuser",
        )

    def get_display_name(self, obj):
        """
        Return display name with fallback hierarchy:
        1. first_name (if available)
        2. preferred_username (if set)
        3. username (system fallback)
        """
        if obj.first_name:
            return obj.first_name
        elif obj.preferred_username:
            return obj.preferred_username
        return obj.username

    def validate_email(self, value):
        """
        Validate email uniqueness when updating.
        """
        user = self.instance
        if user and value != user.email:
            # Check if email is already taken by another user
            if User.objects.filter(email=value).exclude(id=user.id).exists():
                raise serializers.ValidationError(
                    "This email is already in use by another account."
                )
        return value

    def validate_preferred_username(self, value):
        """
        Validate preferred username format and uniqueness.
        """
        if value:
            import re
            # Username requirements:
            # - 3-30 characters
            # - Alphanumeric + underscores and hyphens
            # - Must start with letter or number
            # - Cannot be system-generated pattern (user_123456)
            if len(value) < 3 or len(value) > 30:
                raise serializers.ValidationError(
                    "Username must be between 3 and 30 characters."
                )
            
            if not re.match(r'^[a-zA-Z0-9][a-zA-Z0-9_-]*$', value):
                raise serializers.ValidationError(
                    "Username can only contain letters, numbers, underscores, and hyphens. Must start with a letter or number."
                )
            
            # Prevent system-generated username pattern
            if re.match(r'^user_\d+$', value.lower()):
                raise serializers.ValidationError(
                    "This username format is reserved. Please choose a different one."
                )
            
            # Check uniqueness
            user = self.instance
            if user and value != user.preferred_username:
                if User.objects.filter(preferred_username=value).exclude(id=user.id).exists():
                    raise serializers.ValidationError(
                        "This username is already taken. Please choose another."
                    )
        return value

    def validate_phone(self, value):
        """
        Validate phone number format and uniqueness.
        """
        if value:
            # Basic phone validation (can be enhanced)
            import re

            phone_pattern = re.compile(
                r"^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$"
            )
            if not phone_pattern.match(value):
                raise serializers.ValidationError("Please enter a valid phone number.")

            # Check uniqueness for OTP users
            user = self.instance
            if user and value != user.phone:
                if User.objects.filter(phone=value).exclude(id=user.id).exists():
                    raise serializers.ValidationError(
                        "This phone number is already in use by another account."
                    )
        return value
