from django.contrib import admin
from .models import SupportConversation, SupportMessage


class SupportMessageInline(admin.TabularInline):
    model = SupportMessage
    extra = 0
    readonly_fields = (
        "sender_type",
        "sender_id",
        "message_text",
        "created_at",
        "is_read",
        "ip_address",
    )
    can_delete = False
    fields = ("sender_type", "message_text", "created_at", "is_read")
    ordering = ("created_at",)


@admin.register(SupportConversation)
class SupportConversationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user_email",
        "user",
        "status",
        "priority",
        "created_at",
        "message_count",
    )
    list_filter = ("status", "priority", "created_at")
    search_fields = ("user_email", "user__email", "user__username", "page_url")
    readonly_fields = ("created_at", "updated_at", "ip_address", "user_agent")
    inlines = [SupportMessageInline]

    fieldsets = (
        ("Conversation Info", {"fields": ("user", "user_email", "status", "priority")}),
        ("Context", {"fields": ("page_url", "user_agent", "ip_address")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    def message_count(self, obj):
        return obj.messages.count()

    message_count.short_description = "Messages"


@admin.register(SupportMessage)
class SupportMessageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "conversation",
        "sender_type",
        "message_preview",
        "created_at",
        "is_read",
    )
    list_filter = ("sender_type", "is_read", "created_at")
    search_fields = ("message_text", "conversation__user_email")
    readonly_fields = ("created_at", "ip_address", "user_agent")

    fieldsets = (
        (
            "Message Info",
            {
                "fields": (
                    "conversation",
                    "sender_type",
                    "sender_id",
                    "message_text",
                    "is_read",
                )
            },
        ),
        ("Metadata", {"fields": ("ip_address", "user_agent", "created_at")}),
    )

    def message_preview(self, obj):
        return (
            obj.message_text[:50] + "..."
            if len(obj.message_text) > 50
            else obj.message_text
        )

    message_preview.short_description = "Message"
