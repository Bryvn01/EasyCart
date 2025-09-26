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
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

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