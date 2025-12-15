from rest_framework import serializers
from .models import SupportConversation, SupportMessage
from django.contrib.auth import get_user_model
from .security import MessageSecurityValidator

User = get_user_model()


class SupportMessageSerializer(serializers.ModelSerializer):
    """Serializer for support messages"""

    class Meta:
        model = SupportMessage
        fields = [
            "id",
            "conversation",
            "sender_type",
            "sender_id",
            "message_text",
            "is_read",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "sender_type",
            "sender_id",
        ]

    def validate_message_text(self, value):
        """Validate message text"""
        # Remove extra whitespace
        value = value.strip()

        # Check minimum length
        if len(value) < 1:
            raise serializers.ValidationError("Message cannot be empty")

        # Check maximum length
        if len(value) > 5000:
            raise serializers.ValidationError("Message too long (max 5000 characters)")

        return value


class SupportConversationSerializer(serializers.ModelSerializer):
    """Serializer for support conversations"""

    messages = SupportMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = SupportConversation
        fields = [
            "id",
            "user",
            "user_email",
            "status",
            "priority",
            "created_at",
            "updated_at",
            "closed_at",
            "page_url",
            "messages",
            "message_count",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "user"]

    def get_message_count(self, obj):
        """Get total message count"""
        return obj.messages.count()


class CreateMessageSerializer(serializers.Serializer):
    """Serializer for creating a new support message"""

    message_text = serializers.CharField(max_length=5000, trim_whitespace=True)
    user_email = serializers.EmailField(required=False)
    page_url = serializers.URLField(max_length=500, required=False)

    def validate_message_text(self, value):
        """Validate and sanitize message text with comprehensive security checks"""
        # Run comprehensive security validation
        is_valid, sanitized_text, error_message = (
            MessageSecurityValidator.validate_message(
                value, allow_urls=True  # Allow URLs but validate them
            )
        )

        if not is_valid:
            raise serializers.ValidationError(error_message)

        return sanitized_text
