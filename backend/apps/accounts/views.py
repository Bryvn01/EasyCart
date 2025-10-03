from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
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

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    # Sanitize address field to prevent path traversal
    data = request.data.copy()
    if 'address' in data:
        # Remove path traversal sequences and dangerous characters
        raw_address = str(data['address'])[:200]  # Limit length
        # Remove all path traversal patterns and normalize
        sanitized = ''.join(c for c in raw_address if c.isalnum() or c in ' .,#-')
        data['address'] = escape(sanitized).strip()
    
    # Additional sanitization for all string fields
    for key, value in data.items():
        if isinstance(value, str):
            data[key] = re.sub(r'[.]{2,}|[/\\]|%2e|%2f|%5c', '', escape(str(value)[:500]))
    
    serializer = UserRegistrationSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
def profile(request):
    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)
    elif request.method == 'PUT':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email')
    if not email:
        return Response({'email': ['Email is required']}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        reset_url = f"{frontend_url}/reset-password?uid={uid}&token={token}"
        
        # Send email
        subject = 'Reset Your Password - EasyCart'
        message = f'''
Hello {user.username},

You requested to reset your password for your EasyCart account.

Click the link below to reset your password:
{reset_url}

This link will expire in 24 hours.

If you didn't request this password reset, please ignore this email.

Best regards,
The EasyCart Team
'''
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            # Log the error but don't expose it to the user
            print(f"Failed to send email: {e}")
            # In development, return the URL for testing
            if settings.DEBUG:
                return Response({
                    'message': 'Password reset email sent',
                    'reset_url': reset_url
                }, status=status.HTTP_200_OK)
        
        return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        # Don't reveal if email exists or not for security
        return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    password = request.data.get('password')
    
    if not all([uid, token, password]):
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        if default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
    except (User.DoesNotExist, ValueError):
        return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_email(request):
    email = request.data.get('email')
    if not email:
        return Response({'email': ['Email is required']}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        if user.email_verified:
            return Response({'message': 'Email is already verified'}, status=status.HTTP_200_OK)
        
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        verification_url = f"{frontend_url}/verify-email?uid={uid}&token={token}"
        
        # Send email
        subject = 'Verify Your Email - EasyCart'
        message = f'''
Hello {user.username},

Welcome to EasyCart! Please verify your email address to activate your account.

Click the link below to verify your email:
{verification_url}

This link will expire in 24 hours.

If you didn't create an account with EasyCart, please ignore this email.

Best regards,
The EasyCart Team
'''
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            # Log the error but don't expose it to the user
            print(f"Failed to send email: {e}")
            # In development, return the URL for testing
            if settings.DEBUG:
                return Response({
                    'message': 'Verification email sent',
                    'verification_url': verification_url
                }, status=status.HTTP_200_OK)
        
        return Response({'message': 'Verification email sent'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        # Don't reveal if email exists or not for security
        return Response({'message': 'Verification email sent'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    
    if not all([uid, token]):
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        if default_token_generator.check_token(user, token):
            user.email_verified = True
            user.save()
            return Response({'message': 'Email verified successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid or expired verification link'}, status=status.HTTP_400_BAD_REQUEST)
    except (User.DoesNotExist, ValueError):
        return Response({'error': 'Invalid verification link'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def change_password(request):
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not all([old_password, new_password]):
        return Response({'error': 'Both old and new passwords are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not request.user.check_password(old_password):
        return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
    
    request.user.set_password(new_password)
    request.user.save()
    
    return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)