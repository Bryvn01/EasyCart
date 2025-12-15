from rest_framework import serializers
from .models import Order, OrderItem, Cart, CartItem
from apps.products.serializers import ProductSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_image = serializers.CharField(source="product.image", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "product_image", "quantity", "price"]


class OrderSerializer(serializers.ModelSerializer):

    from apps.accounts.serializers import UserSerializer

    user_details = UserSerializer(source="user", read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "user_details",
            "total_amount",
            "status",
            "payment_status",
            "payment_method",
            "payment_reference",
            "shipping_address",
            "phone_number",
            "transaction_id",
            "items",
            "items_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_items_count(self, obj):
        return obj.items.count()

    def to_representation(self, instance):
        """
        Ensure clean, normalized data output.
        Industry best practice: Always return consistent, validated data.
        """
        representation = super().to_representation(instance)

        # Normalize status to lowercase and trim whitespace
        if representation.get("status"):
            representation["status"] = str(representation["status"]).lower().strip()

        # Normalize payment_status
        if representation.get("payment_status"):
            representation["payment_status"] = (
                str(representation["payment_status"]).lower().strip()
            )

        # Ensure total_amount is a valid decimal string
        if representation.get("total_amount"):
            try:
                representation["total_amount"] = (
                    f"{float(representation['total_amount']):.2f}"
                )
            except (ValueError, TypeError):
                representation["total_amount"] = "0.00"

        return representation


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_id", "quantity"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "items", "total_price", "created_at"]

    def get_total_price(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())
