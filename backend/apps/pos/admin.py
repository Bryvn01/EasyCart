from django.contrib import admin
from apps.pos.models import (
    POSSession,
    POSTransaction,
    POSTransactionItem,
    POSPaymentSplit,
    POSStaffPermission,
    POSDiscount,
    POSReceipt,
)


@admin.register(POSSession)
class POSSessionAdmin(admin.ModelAdmin):
    list_display = [
        "session_number",
        "staff",
        "status",
        "opened_at",
        "closed_at",
        "total_sales",
        "total_transactions",
    ]
    list_filter = ["status", "opened_at", "staff"]
    search_fields = ["session_number", "staff__username"]
    readonly_fields = [
        "session_number",
        "opened_at",
        "closed_at",
        "expected_cash",
        "cash_difference",
        "total_sales",
        "total_transactions",
    ]
    fieldsets = (
        ("Session Info", {"fields": ("staff", "session_number", "status")}),
        (
            "Cash Tracking",
            {
                "fields": (
                    "opening_cash",
                    "closing_cash",
                    "expected_cash",
                    "cash_difference",
                )
            },
        ),
        ("Timestamps", {"fields": ("opened_at", "closed_at")}),
        ("Notes", {"fields": ("opening_notes", "closing_notes")}),
        ("Summary", {"fields": ("total_sales", "total_transactions")}),
    )


class POSTransactionItemInline(admin.TabularInline):
    model = POSTransactionItem
    extra = 0
    readonly_fields = ["product_name", "product_sku", "line_total"]


class POSPaymentSplitInline(admin.TabularInline):
    model = POSPaymentSplit
    extra = 0


@admin.register(POSTransaction)
class POSTransactionAdmin(admin.ModelAdmin):
    list_display = [
        "transaction_number",
        "session",
        "status",
        "payment_method",
        "total_amount",
        "created_at",
    ]
    list_filter = ["status", "payment_method", "created_at", "session__staff"]
    search_fields = [
        "transaction_number",
        "customer_name",
        "customer_phone",
        "session__session_number",
    ]
    readonly_fields = [
        "transaction_number",
        "subtotal",
        "total_amount",
        "change_given",
        "created_at",
        "updated_at",
        "completed_at",
    ]
    inlines = [POSTransactionItemInline, POSPaymentSplitInline]
    fieldsets = (
        ("Transaction Info", {"fields": ("session", "transaction_number", "status")}),
        (
            "Customer Info",
            {
                "fields": (
                    "customer",
                    "customer_name",
                    "customer_phone",
                    "customer_email",
                )
            },
        ),
        (
            "Payment",
            {
                "fields": (
                    "payment_method",
                    "subtotal",
                    "discount_percentage",
                    "discount_amount",
                    "tax_amount",
                    "total_amount",
                    "amount_paid",
                    "change_given",
                    "payment_reference",
                )
            },
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at", "completed_at")}),
        ("Receipt", {"fields": ("receipt_printed", "receipt_emailed")}),
        ("Notes", {"fields": ("notes",)}),
    )


@admin.register(POSTransactionItem)
class POSTransactionItemAdmin(admin.ModelAdmin):
    list_display = [
        "transaction",
        "product_name",
        "quantity",
        "unit_price",
        "line_total",
    ]
    list_filter = ["transaction__created_at"]
    search_fields = ["product_name", "product_sku", "transaction__transaction_number"]
    readonly_fields = ["product_name", "product_sku", "line_total"]


@admin.register(POSStaffPermission)
class POSStaffPermissionAdmin(admin.ModelAdmin):
    list_display = ["staff", "permission", "granted_by", "granted_at"]
    list_filter = ["permission", "granted_at"]
    search_fields = ["staff__username", "granted_by__username"]
    readonly_fields = ["granted_at"]


@admin.register(POSDiscount)
class POSDiscountAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "code",
        "discount_type",
        "value",
        "is_active",
        "usage_count",
        "max_usage",
    ]
    list_filter = ["is_active", "discount_type", "created_at"]
    search_fields = ["name", "code"]
    readonly_fields = ["usage_count", "created_at", "updated_at"]
    fieldsets = (
        (
            "Basic Info",
            {"fields": ("name", "code", "discount_type", "value", "is_active")},
        ),
        ("Constraints", {"fields": ("min_purchase_amount", "max_discount_amount")}),
        ("Validity", {"fields": ("valid_from", "valid_until")}),
        ("Usage", {"fields": ("usage_count", "max_usage")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(POSReceipt)
class POSReceiptAdmin(admin.ModelAdmin):
    list_display = [
        "receipt_number",
        "transaction",
        "generated_at",
        "printed_count",
        "last_printed_at",
    ]
    list_filter = ["generated_at", "last_printed_at"]
    search_fields = ["receipt_number", "transaction__transaction_number"]
    readonly_fields = [
        "receipt_number",
        "generated_at",
        "printed_count",
        "last_printed_at",
    ]
