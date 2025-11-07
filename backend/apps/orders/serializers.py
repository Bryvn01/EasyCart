from rest_framework import serializers
from .models import Order, OrderItem, Cart, CartItem, PromoCode
from apps.products.serializers import ProductSerializer


class PromoCodeSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = PromoCode
        fields = ["id", "code", "description", "discount_type", "discount_value", 
                  "min_purchase", "is_valid", "valid_until"]
    
    def get_is_valid(self, obj):
        valid, message = obj.is_valid()
        return {"valid": valid, "message": message}


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = "__all__"


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    promo_code_details = PromoCodeSerializer(source="promo_code", read_only=True)

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
    promo_code_details = PromoCodeSerializer(source="promo_code", read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "items", "subtotal", "tax", "shipping", "discount", 
                  "promo_code_details", "total_price", "item_count", "created_at"]

    def get_subtotal(self, obj):
        """Calculate subtotal before tax and shipping"""
        return float(sum(item.product.price * item.quantity for item in obj.items.all()))
    
    def get_discount(self, obj):
        """Calculate discount from promo code if applied"""
        if obj.promo_code:
            valid, _ = obj.promo_code.is_valid()
            if valid:
                subtotal = self.get_subtotal(obj)
                return float(obj.promo_code.calculate_discount(subtotal))
        return 0.0
    
    def get_tax(self, obj):
        """Calculate tax (16% VAT for Kenya) on subtotal after discount"""
        subtotal = self.get_subtotal(obj)
        discount = self.get_discount(obj)
        taxable_amount = subtotal - discount
        tax_rate = 0.16  # 16% VAT
        return float(taxable_amount * tax_rate)
    
    def get_shipping(self, obj):
        """Calculate shipping cost (free over 2000 KSh before discount)"""
        subtotal = self.get_subtotal(obj)
        if subtotal >= 2000:
            return 0.0
        return 100.0  # Flat rate shipping
    
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
