from django.contrib import admin
from django import forms
from simple_history.admin import SimpleHistoryAdmin
from .models import Category, Product


class CategoryAdminForm(forms.ModelForm):
    image_url = forms.URLField(required=False, label="Image URL", help_text="Enter image URL or upload a file below")
    
    class Meta:
        model = Category
        fields = '__all__'


@admin.register(Category)
class CategoryAdmin(SimpleHistoryAdmin):
    form = CategoryAdminForm
    list_display = ["name", "description", "image_preview", "created_at"]
    search_fields = ["name"]
    list_filter = ["created_at"]
    readonly_fields = ["image_preview"]
    
    fieldsets = (
        ("Basic Information", {"fields": ("name", "slug", "description", "is_active")}),
        ("Media", {"fields": ("image_url", "image", "image_preview")}),
    )
    
    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="60" height="60" style="object-fit:cover;" />'
        return ""
    
    image_preview.allow_tags = True
    image_preview.short_description = "Preview"


@admin.register(Product)
class ProductAdmin(SimpleHistoryAdmin):
    list_display = ["name", "category", "price", "stock", "is_active", "is_featured", "created_at", "image_preview"]
    list_filter = ["category", "is_active", "is_featured", "created_at"]
    search_fields = ["name", "description"]
    list_editable = ["price", "stock", "is_active", "is_featured"]
    readonly_fields = ["created_at", "updated_at", "image_preview"]

    actions = ["make_active", "make_featured"]

    fieldsets = (
        ("Basic Information", {"fields": ("name", "slug", "description", "short_description", "category", "brand")}),
        ("Pricing & Stock", {"fields": ("price", "compare_price", "stock", "sku")}),
        ("Media", {"fields": ("image_url", "image", "image_preview"), "description": "Enter image URL or upload a file. URL takes precedence if both are provided."}),
        ("Status", {"fields": ("is_active", "is_featured")}),
        ("SEO", {"fields": ("meta_title", "meta_description"), "classes": ("collapse",)}),
        ("Additional", {"fields": ("weight", "dimensions"), "classes": ("collapse",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
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
