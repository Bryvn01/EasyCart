from django.contrib import admin
from .models import Order, OrderItem, Cart, CartItem, PromoCode


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "discount_type",
        "discount_value",
        "min_purchase",
        "usage_count",
        "usage_limit",
        "active",
        "valid_from",
        "valid_until",
    ]
    list_filter = ["discount_type", "active", "valid_from", "valid_until"]
    search_fields = ["code", "description"]
    list_editable = ["active"]
    readonly_fields = ["usage_count", "created_at"]
    
    fieldsets = (
        (
            "Promo Code Details",
            {
                "fields": (
                    "code",
                    "description",
                    "discount_type",
                    "discount_value",
                    "min_purchase",
                    "max_discount",
                )
            },
        ),
        (
            "Validity",
            {
                "fields": (
                    "active",
                    "valid_from",
                    "valid_until",
                    "usage_limit",
                    "usage_count",
                )
            },
        ),
        (
            "Metadata",
            {"fields": ("created_at",), "classes": ("collapse",)},
        ),
    )


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product", "quantity", "price"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "user",
        "total_amount",
        "discount_amount",
        "promo_code",
        "status",
        "payment_status",
        "payment_method",
        "created_at",
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
        "created_at",
        "updated_at",
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
                    "discount_amount",
                    "promo_code",
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


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ["user", "promo_code", "created_at", "updated_at"]
    search_fields = ["user__username"]
    list_filter = ["created_at", "updated_at"]
    inlines = [CartItemInline]
