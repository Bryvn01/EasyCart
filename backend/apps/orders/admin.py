from django.contrib import admin
from django.db.models import Count, Q
from django.utils import timezone
from django.utils.html import format_html
import pytz

from .models import Cart, CartItem, Order, OrderItem, OrderNotification


class TimezoneAwareAdmin(admin.ModelAdmin):
    """Base admin class that displays times in East Africa Time (UTC+3)"""

    def get_display_timezone(self):
        """Get the timezone for display (East Africa Time)"""
        return pytz.timezone("Africa/Nairobi")  # UTC+3

    def display_local_time(self, obj, field_name):
        """Convert UTC time to local timezone for display"""
        utc_time = getattr(obj, field_name)
        if utc_time and timezone.is_aware(utc_time):
            local_tz = self.get_display_timezone()
            local_time = utc_time.astimezone(local_tz)
            return local_time.strftime("%Y-%m-%d %I:%M:%S %p %Z")
        return utc_time

    def created_at_local(self, obj):
        """Display created_at in local timezone"""
        return self.display_local_time(obj, "created_at")

    created_at_local.short_description = "Created At (Local)"
    created_at_local.admin_order_field = "created_at"

    def updated_at_local(self, obj):
        """Display updated_at in local timezone"""
        return self.display_local_time(obj, "updated_at")

    updated_at_local.short_description = "Updated At (Local)"
    updated_at_local.admin_order_field = "updated_at"


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product", "quantity", "price"]


@admin.register(Order)
class OrderAdmin(TimezoneAwareAdmin):
    list_display = [
        "id",
        "user",
        "total_amount",
        "status",
        "payment_status",
        "payment_method",
        "notification_status",
        "created_at_local",  # Show local time instead of UTC
    ]
    list_filter = ["status", "payment_status", "payment_method", "created_at"]
    search_fields = [
        "user__username",
        "user__email",
        "payment_reference",
        "transaction_id",
    ]
    list_editable = ["status"]
    inlines = [OrderItemInline]
    readonly_fields = [
        "created_at_local",  # Show local time
        "updated_at_local",  # Show local time
        "created_at",  # Keep UTC time for reference
        "updated_at",  # Keep UTC time for reference
        "transaction_id",
        "payment_reference",
    ]

    fieldsets = (
        (
            "Order Information",
            {
                "fields": (
                    "user",
                    "total_amount",
                    "status",
                    "shipping_address",
                    "phone_number",
                )
            },
        ),
        (
            "Payment Details",
            {
                "fields": (
                    "payment_method",
                    "payment_status",
                    "payment_reference",
                    "transaction_id",
                )
            },
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.annotate(
            unread_notification_count=Count(
                "notifications",
                filter=Q(notifications__is_read=False),
            )
        )

    def notification_status(self, obj):
        unread_count = getattr(obj, "unread_notification_count", 0)
        color = "red" if unread_count > 0 else "green"
        return format_html(
            '<span style="color: {};">{} unread</span>',
            color,
            unread_count,
        )

    notification_status.short_description = "Notifications"


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ["user", "created_at"]
    search_fields = ["user__username"]
    inlines = [CartItemInline]


@admin.register(OrderNotification)
class OrderNotificationAdmin(admin.ModelAdmin):
    list_display = ["id", "order", "recipient", "order_status", "is_read", "created_at"]
    list_filter = ["is_read", "order_status", "created_at"]
    search_fields = ["order__id", "recipient__email", "message"]
