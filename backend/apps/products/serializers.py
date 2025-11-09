from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "image",
            "image_url",
            "is_active",
            "created_at",
            "products_count",
        ]
        read_only_fields = ["slug", "created_at"]

    def get_products_count(self, obj):
        # PERFORMANCE: Use cached count if available
        if hasattr(obj, "_products_count"):
            return obj._products_count
        return obj.products.filter(is_active=True).count()

    def get_image(self, obj):
        """Return clean image URL without /media/ prefix for external URLs"""
        # Priority: image_url field > image field
        if obj.image_url:
            return obj.image_url
        if obj.image:
            image_url = str(obj.image)
            # If it's a Cloudinary URL, return it directly
            if image_url.startswith("http://") or image_url.startswith("https://"):
                return image_url
            # Otherwise, return the full URL with media prefix
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    image = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    def get_image(self, obj):
        """Return clean image URL without /media/ prefix for external URLs"""
        if obj.image:
            image_url = str(obj.image)
            # If it's a Cloudinary URL, return it directly
            if image_url.startswith("http://") or image_url.startswith("https://"):
                return image_url
            # Otherwise, return the full URL with media prefix
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_thumbnail_url(self, obj):
        """Return thumbnail URL or generate one from image_url"""
        if obj.thumbnail_url:
            return obj.thumbnail_url
        # Fallback: generate thumbnail from image_url if available
        if obj.image_url and 'cloudinary.com' in obj.image_url:
            return obj.image_url.replace('/upload/', '/upload/w_100,q_auto,f_auto/')
        # Fallback: use image method
        image_url = self.get_image(obj)
        if image_url and 'cloudinary.com' in image_url:
            return image_url.replace('/upload/', '/upload/w_100,q_auto,f_auto/')
        return image_url

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
            "thumbnail_url",
            "blurhash",
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
