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
    items = OrderItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
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
