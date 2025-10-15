from rest_framework import serializers
from .models import Product, Category, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'is_active', 'created_at', 'products_count']
        read_only_fields = ['slug', 'created_at']
    
    def get_products_count(self, obj):
        return obj.products.filter(is_active=True).count()

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    is_on_sale = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description', 'price', 
            'compare_price', 'category', 'category_name', 'image', 'image_url',
            'stock', 'sku', 'weight', 'dimensions', 'brand', 'is_active', 
            'is_featured', 'view_count', 'meta_title', 'meta_description',
            'created_at', 'updated_at', 'images', 'average_rating', 
            'review_count', 'is_on_sale', 'discount_percentage'
        ]
        read_only_fields = ['slug', 'sku', 'view_count', 'created_at', 'updated_at']

class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Simplified serializer for create/update operations"""
    
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'short_description', 'price', 'compare_price',
            'category', 'image', 'image_url', 'stock', 'weight', 'dimensions',
            'brand', 'is_active', 'is_featured', 'meta_title', 'meta_description'
        ]
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value
    
    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative")
        return value

class BulkProductUpdateSerializer(serializers.Serializer):
    product_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    update_data = serializers.DictField()
    
    def validate_update_data(self, value):
        allowed_fields = [
            'price', 'stock', 'is_active', 'is_featured', 'category'
        ]
        for field in value.keys():
            if field not in allowed_fields:
                raise serializers.ValidationError(f"Field '{field}' is not allowed for bulk update")
        return value