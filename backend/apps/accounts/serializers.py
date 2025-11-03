from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='viewer', required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'phone', 'address', 'role')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        # Only allow role assignment if user is superadmin or manager
        request = self.context.get('request')
        if 'role' in attrs:
            if request and request.user.is_authenticated:
                if request.user.role not in ['superadmin', 'manager']:
                    attrs['role'] = 'viewer'
            else:
                attrs['role'] = 'viewer'
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        if 'role' not in validated_data:
            validated_data['role'] = 'viewer'
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            attrs['user'] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'address', 'role', 'is_admin', 'is_staff', 'is_superuser')
