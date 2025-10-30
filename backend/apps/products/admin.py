from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(SimpleHistoryAdmin):
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name']
    list_filter = ['created_at']

@admin.register(Product)
class ProductAdmin(SimpleHistoryAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'is_active', 'is_featured', 'created_at', 'image_preview']
    list_filter = ['category', 'is_active', 'is_featured', 'created_at']
    search_fields = ['name', 'description']
    list_editable = ['price', 'stock', 'is_active', 'is_featured']
    readonly_fields = ['created_at', 'updated_at', 'image_preview']

    actions = ['make_active', 'make_featured']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'stock', 'is_active', 'is_featured')
        }),
        ('Media', {
            'fields': ('image', 'image_url', 'image_preview')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="60" height="60" style="object-fit:cover;" />'
        return ""
    image_preview.allow_tags = True
    image_preview.short_description = 'Image'

    def make_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} products marked as active.")
    make_active.short_description = "Mark selected products as active"

    def make_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f"{updated} products marked as featured.")
    make_featured.short_description = "Mark selected products as featured"