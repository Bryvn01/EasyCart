from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from simple_history.admin import SimpleHistoryAdmin
from .models import User, OTPDeliveryLog


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin, SimpleHistoryAdmin):
    list_display = [
        "username",
        "email",
        "role",
        "is_admin",
        "is_staff",
        "is_superuser",
        "date_joined",
    ]
    list_filter = ["role", "is_admin", "is_staff", "is_superuser", "date_joined"]
    search_fields = ["username", "email"]

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Additional Info", {"fields": ("phone", "address", "role", "is_admin")}),
    )


@admin.register(OTPDeliveryLog)
class OTPDeliveryLogAdmin(admin.ModelAdmin):
    list_display = [
        "identifier",
        "delivery_method",
        "success",
        "ip_address",
        "created_at",
        "user",
    ]
    list_filter = ["delivery_method", "success", "created_at"]
    search_fields = ["identifier", "ip_address", "user__email"]
    readonly_fields = ["created_at"]
    date_hierarchy = "created_at"

    def has_add_permission(self, request):
        # Logs are created automatically, not manually
        return False

    def has_change_permission(self, request, obj=None):
        # Logs should not be edited
        return False
