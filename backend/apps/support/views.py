from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.throttling import AnonRateThrottle
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import SupportConversation, SupportMessage
from .serializers import (
    SupportConversationSerializer,
    SupportMessageSerializer,
    CreateMessageSerializer,
)
from .security import MessageSecurityValidator
import logging

logger = logging.getLogger(__name__)


def get_client_ip(request):
    """Extract client IP address from request"""
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


class SupportMessageRateThrottle(AnonRateThrottle):
    """Custom rate throttle for support messages"""

    rate = "30/hour"  # 30 messages per hour for anonymous users


class CreateSupportMessageView(generics.CreateAPIView):
    """
    Create a new support message with comprehensive security validation.
    Rate limited to prevent spam/abuse.
    """

    permission_classes = [AllowAny]
    serializer_class = CreateMessageSerializer
    throttle_classes = [SupportMessageRateThrottle]

    def create(self, request, *args, **kwargs):
        # Log the request for security monitoring
        client_ip = get_client_ip(request)
        logger.info(f"Support message request from IP: {client_ip}")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message_text = serializer.validated_data["message_text"]
        page_url = serializer.validated_data.get("page_url", "")

        # Additional URL validation if page_url is provided
        if page_url:
            is_safe, reason = MessageSecurityValidator.validate_url(page_url)
            if not is_safe:
                logger.warning(f"Suspicious page_url from {client_ip}: {reason}")
                return Response(
                    {"success": False, "error": "Invalid page URL provided"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Get user info
        user = request.user if request.user.is_authenticated else None
        user_email = serializer.validated_data.get("user_email", "")

        # If authenticated but no email provided, use user's email
        if user and not user_email:
            user_email = user.email
        elif not user_email:
            user_email = "anonymous@guest.com"

        # Check for suspicious behavior (too many open conversations from same email)
        if not user:
            open_conversations_count = SupportConversation.objects.filter(
                user_email=user_email, status="open"
            ).count()

            if open_conversations_count >= 5:
                logger.warning(
                    f"Potential spam: {user_email} has {open_conversations_count} open conversations"
                )
                return Response(
                    {
                        "success": False,
                        "error": "You have too many open conversations. Please wait for a response from our team.",
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

        # Get or create open conversation for this user/email
        conversation = None
        if user:
            conversation = SupportConversation.objects.filter(
                user=user, status="open"
            ).first()

        if not conversation:
            # Create new conversation
            conversation = SupportConversation.objects.create(
                user=user,
                user_email=user_email,
                status="open",
                priority="normal",
                page_url=page_url,
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
                ip_address=client_ip,
            )
            logger.info(f"New conversation created: {conversation.id} for {user_email}")

        # Create message (message_text is already sanitized by serializer)
        message = SupportMessage.objects.create(
            conversation=conversation,
            sender_type="customer",
            sender_id=user.id if user else None,
            message_text=message_text,
            ip_address=client_ip,
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
        )

        # Log URLs found in message for security review
        urls = MessageSecurityValidator.extract_urls(message_text)
        if urls:
            logger.info(f"Message {message.id} contains URLs: {urls}")

        # Update conversation timestamp
        conversation.updated_at = timezone.now()
        conversation.save()

        # Send email notification to support team
        try:
            self.send_support_notification(conversation, message)
        except Exception as e:
            # Log error but don't fail the request
            logger.error(f"Failed to send email notification: {e}")

        # Return success response
        message_data = SupportMessageSerializer(message).data
        conversation_data = SupportConversationSerializer(conversation).data

        return Response(
            {
                "success": True,
                "message": "Message sent successfully. We'll respond via email within 24 hours.",
                "conversation": conversation_data,
                "new_message": message_data,
            },
            status=status.HTTP_201_CREATED,
        )

    def send_support_notification(self, conversation, message):
        """Send email notification to support team"""
        subject = f"New Support Message from {conversation.user_email}"

        message_body = f"""
New support message received:

From: {conversation.user_email}
Conversation ID: {conversation.id}
Page: {conversation.page_url or 'N/A'}
Status: {conversation.status}

Message:
{message.message_text}

---
Reply to this conversation in the admin panel:
{settings.SITE_URL}/admin/support/supportconversation/{conversation.id}/

Time: {message.created_at.strftime('%Y-%m-%d %H:%M:%S')}
IP: {message.ip_address or 'N/A'}
"""

        send_mail(
            subject=subject,
            message=message_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.SUPPORT_EMAIL],
            fail_silently=False,
        )


class MyConversationsView(generics.ListAPIView):
    """Get all conversations for authenticated user"""

    permission_classes = [IsAuthenticated]
    serializer_class = SupportConversationSerializer

    def get_queryset(self):
        return SupportConversation.objects.filter(
            user=self.request.user
        ).prefetch_related("messages")


class ConversationDetailView(generics.RetrieveAPIView):
    """Get conversation details"""

    permission_classes = [IsAuthenticated]
    serializer_class = SupportConversationSerializer

    def get_queryset(self):
        return SupportConversation.objects.filter(
            user=self.request.user
        ).prefetch_related("messages")


class ConversationMessagesView(generics.ListAPIView):
    """Get all messages for a conversation"""

    permission_classes = [IsAuthenticated]
    serializer_class = SupportMessageSerializer

    def get_queryset(self):
        conversation_id = self.kwargs.get("conversation_id")
        return SupportMessage.objects.filter(
            conversation_id=conversation_id, conversation__user=self.request.user
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Simple health check endpoint"""
    return Response(
        {
            "status": "healthy",
            "service": "support",
            "timestamp": timezone.now().isoformat(),
        }
    )
