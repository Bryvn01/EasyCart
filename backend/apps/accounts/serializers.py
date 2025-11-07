from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User
import re


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

    def validate_password(self, value):
        """
        Validate password strength and security requirements.
        """
        # Minimum length check
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long."
            )
        
        # Maximum length check to prevent DoS
        if len(value) > 128:
            raise serializers.ValidationError(
                "Password must not exceed 128 characters."
            )
        
        # Complexity checks
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase letter."
            )
        
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError(
                "Password must contain at least one lowercase letter."
            )
        
        if not re.search(r"\d", value):
            raise serializers.ValidationError(
                "Password must contain at least one digit."
            )
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError(
                "Password must contain at least one special character."
            )
        
        # Use Django's password validators
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        
        return value

    def validate_username(self, value):
        """
        Validate username format and security.
        """
        # Length check
        if len(value) < 3:
            raise serializers.ValidationError(
                "Username must be at least 3 characters long."
            )
        
        if len(value) > 150:
            raise serializers.ValidationError(
                "Username must not exceed 150 characters."
            )
        
        # Alphanumeric and safe characters only
        if not re.match(r'^[a-zA-Z0-9_.-]+$', value):
            raise serializers.ValidationError(
                "Username can only contain letters, numbers, dots, hyphens, and underscores."
            )
        
        return value

    def validate_phone(self, value):
        """
        Validate phone number format.
        """
        if value and not re.match(r'^\+?[1-9]\d{1,14}$', value):
            raise serializers.ValidationError(
                "Please enter a valid phone number."
            )
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        
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
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "phone",
            "address",
            "role",
            "is_admin",
            "is_staff",
            "is_superuser",
        )
