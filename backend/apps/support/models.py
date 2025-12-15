from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import EmailValidator

User = get_user_model()


class SupportConversation(models.Model):
    """Support conversation tracking"""

    STATUS_CHOICES = [
        ("open", "Open"),
        ("pending", "Pending"),
        ("resolved", "Resolved"),
        ("closed", "Closed"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("normal", "Normal"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="support_conversations",
    )
    user_email = models.EmailField(validators=[EmailValidator()])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default="normal"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    # Metadata for context
    page_url = models.URLField(max_length=500, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["user_email", "-created_at"]),
        ]

    def __str__(self):
        return f"Conversation {self.id} - {self.user_email} ({self.status})"


class SupportMessage(models.Model):
    """Individual messages in support conversations"""

    SENDER_CHOICES = [
        ("customer", "Customer"),
        ("agent", "Support Agent"),
        ("system", "System"),
    ]

    conversation = models.ForeignKey(
        SupportConversation, on_delete=models.CASCADE, related_name="messages"
    )
    sender_type = models.CharField(max_length=20, choices=SENDER_CHOICES)
    sender_id = models.IntegerField(null=True, blank=True)  # User ID or Agent ID
    message_text = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["conversation", "created_at"]),
            models.Index(fields=["sender_type", "is_read"]),
        ]

    def __str__(self):
        return f"Message {self.id} in {self.conversation.id} from {self.sender_type}"
