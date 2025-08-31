from rest_framework import serializers
from .wishlist_models import Wishlist, WishlistItem
from .models import Product

class WishlistItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.CharField(source='product.image', read_only=True)
    product_stock = serializers.IntegerField(source='product.stock', read_only=True)
    
    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'product_name', 'product_price', 'product_image', 'product_stock', 'added_at']
        read_only_fields = ['id', 'added_at']

class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'items', 'item_count', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def get_item_count(self, obj):
        return obj.items.count()
