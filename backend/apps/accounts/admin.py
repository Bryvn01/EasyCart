from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from simple_history.admin import SimpleHistoryAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin, SimpleHistoryAdmin):
    list_display = ["username", "email", "role", "is_admin", "is_staff", "is_superuser", "date_joined"]
    list_filter = ["role", "is_admin", "is_staff", "is_superuser", "date_joined"]
    search_fields = ["username", "email"]

    fieldsets = BaseUserAdmin.fieldsets + (("Additional Info", {"fields": ("phone", "address", "role", "is_admin")}),)
