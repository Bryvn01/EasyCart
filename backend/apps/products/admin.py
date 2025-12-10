from django.contrib import admin
from django import forms
from django.utils import timezone
import pytz
from simple_history.admin import SimpleHistoryAdmin
from .models import Category, Product


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


class CategoryAdminForm(forms.ModelForm):
    image_url = forms.URLField(
        required=False,
        label="Image URL",
        help_text="Enter image URL or upload a file below",
    )

    class Meta:
        model = Category
        fields = "__all__"


@admin.register(Category)
class CategoryAdmin(TimezoneAwareAdmin, SimpleHistoryAdmin):
    form = CategoryAdminForm
    list_display = ["name", "description", "image_preview", "created_at_local"]
    search_fields = ["name"]
    list_filter = ["created_at"]
    readonly_fields = ["image_preview", "created_at_local", "created_at"]

    fieldsets = (
        ("Basic Information", {"fields": ("name", "slug", "description", "is_active")}),
        ("Media", {"fields": ("image_url", "image", "image_preview")}),
        ("Timestamps", {"fields": ("created_at_local", "created_at")}),
    )

    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="60" height="60" style="object-fit:cover;" />'
        return ""

    image_preview.allow_tags = True
    image_preview.short_description = "Preview"


@admin.register(Product)
class ProductAdmin(TimezoneAwareAdmin, SimpleHistoryAdmin):
    list_display = [
        "name",
        "category",
        "price",
        "stock",
        "is_active",
        "is_featured",
        "created_at_local",
        "image_preview",
    ]
    list_filter = ["category", "is_active", "is_featured", "created_at"]
    search_fields = ["name", "description"]
    list_editable = ["price", "stock", "is_active", "is_featured"]
    readonly_fields = [
        "created_at_local",
        "updated_at_local",
        "created_at",
        "updated_at",
        "image_preview",
    ]

    actions = ["make_active", "make_featured"]

    fieldsets = (
        (
            "Basic Information",
            {
                "fields": (
                    "name",
                    "slug",
                    "description",
                    "short_description",
                    "category",
                    "brand",
                )
            },
        ),
        ("Pricing & Stock", {"fields": ("price", "compare_price", "stock", "sku")}),
        (
            "Media",
            {
                "fields": ("image_url", "image", "image_preview"),
                "description": "Enter image URL or upload a file. URL takes precedence if both are provided.",
            },
        ),
        ("Status", {"fields": ("is_active", "is_featured")}),
        (
            "SEO",
            {"fields": ("meta_title", "meta_description"), "classes": ("collapse",)},
        ),
        ("Additional", {"fields": ("weight", "dimensions"), "classes": ("collapse",)}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="60" height="60" style="object-fit:cover;" />'
        return ""

    image_preview.allow_tags = True
    image_preview.short_description = "Image"

    def make_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} products marked as active.")

    make_active.short_description = "Mark selected products as active"

    def make_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f"{updated} products marked as featured.")

    make_featured.short_description = "Mark selected products as featured"
