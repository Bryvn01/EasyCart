from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Category name cannot be empty.")
        if len(value) < 2:
            raise serializers.ValidationError("Category name must be at least 2 characters.")
        return value

class ProductSerializer(serializers.ModelSerializer):
    # Nested category serializer for GET requests
    category = CategorySerializer(read_only=True)
    # Category ID for write requests
    category_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'description', 'image', 'image_url', 
                  'category', 'category_id', 'brand', 'stock', 'sku', 'slug', 
                  'created_at', 'updated_at']

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Product name cannot be empty.")
        if len(value) < 2:
            raise serializers.ValidationError("Product name must be at least 2 characters.")
        return value

    def validate_price(self, value):
        if value is None or value < 0:
            raise serializers.ValidationError("Price must be a positive number.")
        return value
    
    def create(self, validated_data):
        category_id = validated_data.pop('category_id', None)
        if category_id:
            validated_data['category_id'] = category_id
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        category_id = validated_data.pop('category_id', None)
        if category_id:
            validated_data['category_id'] = category_id
        return super().update(instance, validated_data)