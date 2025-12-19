from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.pos.models import (
    POSSession,
    POSTransaction,
    POSTransactionItem,
    POSPaymentSplit,
    POSStaffPermission,
    POSDiscount,
    POSReceipt,
)
from apps.products.models import Product

User = get_user_model()


class POSSessionSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source="staff.username", read_only=True)
    staff_email = serializers.CharField(source="staff.email", read_only=True)
    duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = POSSession
        fields = [
            "id",
            "staff",
            "staff_name",
            "staff_email",
            "session_number",
            "status",
            "opening_cash",
            "closing_cash",
            "expected_cash",
            "cash_difference",
            "opened_at",
            "closed_at",
            "opening_notes",
            "closing_notes",
            "total_sales",
            "total_transactions",
            "duration_minutes",
        ]
        read_only_fields = [
            "session_number",
            "expected_cash",
            "cash_difference",
            "total_sales",
            "total_transactions",
            "opened_at",
        ]

    def get_duration_minutes(self, obj):
        """Calculate session duration in minutes."""
        if obj.closed_at:
            delta = obj.closed_at - obj.opened_at
            return int(delta.total_seconds() / 60)
        return None


class POSTransactionItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(read_only=True)
    product_sku = serializers.CharField(read_only=True)
    available_stock = serializers.SerializerMethodField()

    class Meta:
        model = POSTransactionItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "unit_price",
            "quantity",
            "discount_percentage",
            "discount_amount",
            "line_total",
            "available_stock",
        ]
        read_only_fields = [
            "product_name",
            "product_sku",
            "discount_amount",
            "line_total",
        ]

    def get_available_stock(self, obj):
        """Get current available stock for the product."""
        return obj.product.stock

    def validate(self, data):
        """Validate that sufficient stock is available."""
        product = data.get("product")
        quantity = data.get("quantity", 0)

        if product and quantity > product.stock:
            raise serializers.ValidationError(
                {"quantity": f"Insufficient stock. Available: {product.stock}"}
            )

        return data


class POSPaymentSplitSerializer(serializers.ModelSerializer):
    class Meta:
        model = POSPaymentSplit
        fields = ["id", "payment_method", "amount", "payment_reference"]


class POSTransactionSerializer(serializers.ModelSerializer):
    items = POSTransactionItemSerializer(many=True, required=False)
    payment_splits = POSPaymentSplitSerializer(many=True, required=False)
    staff_name = serializers.CharField(source="session.staff.username", read_only=True)
    session_number = serializers.CharField(
        source="session.session_number", read_only=True
    )

    class Meta:
        model = POSTransaction
        fields = [
            "id",
            "session",
            "session_number",
            "staff_name",
            "transaction_number",
            "customer",
            "customer_name",
            "customer_phone",
            "customer_email",
            "status",
            "payment_method",
            "subtotal",
            "discount_amount",
            "discount_percentage",
            "tax_amount",
            "total_amount",
            "amount_paid",
            "change_given",
            "payment_reference",
            "notes",
            "created_at",
            "updated_at",
            "completed_at",
            "receipt_printed",
            "receipt_emailed",
            "items",
            "payment_splits",
        ]
        read_only_fields = [
            "transaction_number",
            "subtotal",
            "total_amount",
            "change_given",
            "created_at",
            "updated_at",
            "completed_at",
        ]

    def create(self, validated_data):
        """Create transaction with items and payment splits."""
        items_data = validated_data.pop("items", [])
        payment_splits_data = validated_data.pop("payment_splits", [])

        # Calculate subtotal from items
        subtotal = sum(
            item_data["unit_price"] * item_data["quantity"] for item_data in items_data
        )
        validated_data["subtotal"] = subtotal

        # Create transaction
        transaction = POSTransaction.objects.create(**validated_data)

        # Create items
        for item_data in items_data:
            POSTransactionItem.objects.create(transaction=transaction, **item_data)

        # Create payment splits if mixed payment
        if payment_splits_data:
            for split_data in payment_splits_data:
                POSPaymentSplit.objects.create(transaction=transaction, **split_data)

        return transaction

    def update(self, instance, validated_data):
        """Update transaction (limited fields can be updated)."""
        items_data = validated_data.pop("items", None)
        payment_splits_data = validated_data.pop("payment_splits", None)

        # Only allow updates if transaction is still pending
        if instance.status != "pending":
            raise serializers.ValidationError(
                "Cannot update completed or cancelled transactions"
            )

        # Update transaction fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Recalculate subtotal if items changed
        if items_data is not None:
            # Delete existing items
            instance.items.all().delete()
            # Create new items
            subtotal = 0
            for item_data in items_data:
                POSTransactionItem.objects.create(transaction=instance, **item_data)
                subtotal += item_data["unit_price"] * item_data["quantity"]
            instance.subtotal = subtotal

        instance.save()
        return instance


class POSStaffPermissionSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source="staff.username", read_only=True)
    granted_by_name = serializers.CharField(
        source="granted_by.username", read_only=True
    )
    permission_display = serializers.CharField(
        source="get_permission_display", read_only=True
    )

    class Meta:
        model = POSStaffPermission
        fields = [
            "id",
            "staff",
            "staff_name",
            "permission",
            "permission_display",
            "granted_by",
            "granted_by_name",
            "granted_at",
        ]
        read_only_fields = ["granted_at"]


class POSDiscountSerializer(serializers.ModelSerializer):
    is_valid_now = serializers.SerializerMethodField()

    class Meta:
        model = POSDiscount
        fields = [
            "id",
            "name",
            "code",
            "discount_type",
            "value",
            "min_purchase_amount",
            "max_discount_amount",
            "is_active",
            "valid_from",
            "valid_until",
            "usage_count",
            "max_usage",
            "is_valid_now",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["usage_count", "created_at", "updated_at"]

    def get_is_valid_now(self, obj):
        """Check if discount is currently valid."""
        return obj.is_valid()


class POSReceiptSerializer(serializers.ModelSerializer):
    transaction_number = serializers.CharField(
        source="transaction.transaction_number", read_only=True
    )

    class Meta:
        model = POSReceipt
        fields = [
            "id",
            "transaction",
            "transaction_number",
            "receipt_number",
            "receipt_data",
            "generated_at",
            "printed_count",
            "last_printed_at",
        ]
        read_only_fields = [
            "receipt_number",
            "generated_at",
            "printed_count",
            "last_printed_at",
        ]


class ProductQuickSearchSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product search in POS."""

    class Meta:
        model = Product
        fields = ["id", "name", "sku", "price", "stock", "image_url", "category"]


class POSDashboardStatsSerializer(serializers.Serializer):
    """Serializer for POS dashboard statistics."""

    total_sales = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_transactions = serializers.IntegerField()
    average_transaction = serializers.DecimalField(max_digits=10, decimal_places=2)
    cash_sales = serializers.DecimalField(max_digits=10, decimal_places=2)
    card_sales = serializers.DecimalField(max_digits=10, decimal_places=2)
    mobile_money_sales = serializers.DecimalField(max_digits=10, decimal_places=2)
    top_products = serializers.ListField()
    hourly_sales = serializers.ListField()
    daily_sales = serializers.ListField()
