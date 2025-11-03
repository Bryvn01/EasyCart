from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "image", "is_active", "created_at", "products_count"]
        read_only_fields = ["slug", "created_at"]

    def get_products_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "short_description",
            "price",
            "compare_price",
            "category",
            "category_name",
            "image",
            "image_url",
            "stock",
            "sku",
            "weight",
            "dimensions",
            "brand",
            "is_active",
            "is_featured",
            "view_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["slug", "sku", "view_count", "created_at", "updated_at"]


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "name",
            "description",
            "short_description",
            "price",
            "compare_price",
            "category",
            "image",
            "image_url",
            "stock",
            "weight",
            "dimensions",
            "brand",
            "is_active",
            "is_featured",
        ]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value
