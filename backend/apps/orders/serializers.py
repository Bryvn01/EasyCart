from rest_framework import serializers
from .models import Order, OrderItem, Cart, CartItem
from apps.products.serializers import ProductSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = "__all__"


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = "__all__"


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_id", "quantity", "subtotal"]
    
    def get_subtotal(self, obj):
        """Calculate subtotal for this cart item"""
        return float(obj.product.price * obj.quantity)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()
    tax = serializers.SerializerMethodField()
    shipping = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()
    discount = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "items", "subtotal", "tax", "shipping", "discount", "total_price", "item_count", "created_at"]

    def get_subtotal(self, obj):
        """Calculate subtotal before tax and shipping"""
        return float(sum(item.product.price * item.quantity for item in obj.items.all()))
    
    def get_tax(self, obj):
        """Calculate tax (16% VAT for Kenya)"""
        subtotal = self.get_subtotal(obj)
        tax_rate = 0.16  # 16% VAT
        return float(subtotal * tax_rate)
    
    def get_shipping(self, obj):
        """Calculate shipping cost (free over 2000 KSh)"""
        subtotal = self.get_subtotal(obj)
        if subtotal >= 2000:
            return 0.0
        return 100.0  # Flat rate shipping
    
    def get_discount(self, obj):
        """Calculate any active discounts (placeholder for promo code support)"""
        # TODO: Implement promo code logic
        return 0.0
    
    def get_total_price(self, obj):
        """Calculate total including tax and shipping, minus discounts"""
        subtotal = self.get_subtotal(obj)
        tax = self.get_tax(obj)
        shipping = self.get_shipping(obj)
        discount = self.get_discount(obj)
        return float(subtotal + tax + shipping - discount)
    
    def get_item_count(self, obj):
        """Total number of items in cart"""
        return sum(item.quantity for item in obj.items.all())
