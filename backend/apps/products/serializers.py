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
        fields = ['id', 'image', 'image_url', 'alt_text', 'is_primary', 'order']

    def validate(self, data):
        image = data.get('image')
        image_url = data.get('image_url')
        if not image and not image_url:
            raise serializers.ValidationError('Either image file or image_url must be provided.')
        return data

    def create(self, validated_data):
        image_url = validated_data.pop('image_url', None)
        image = validated_data.get('image', None)
        if image_url and not image:
            # Fetch image from URL and save to image field
            from django.core.files.base import ContentFile
            import requests
            import os
            try:
                response = requests.get(image_url)
                response.raise_for_status()
                file_name = os.path.basename(image_url.split('?')[0])
                validated_data['image'] = ContentFile(response.content, name=file_name)
            except Exception as e:
                raise serializers.ValidationError({'image_url': f'Failed to fetch image from URL: {e}'})
        return super().create(validated_data)

    def update(self, instance, validated_data):
        image_url = validated_data.pop('image_url', None)
        image = validated_data.get('image', None)
        if image_url and not image:
            from django.core.files.base import ContentFile
            import requests
            import os
            try:
                response = requests.get(image_url)
                response.raise_for_status()
                file_name = os.path.basename(image_url.split('?')[0])
                instance.image.save(file_name, ContentFile(response.content), save=False)
            except Exception as e:
                raise serializers.ValidationError({'image_url': f'Failed to fetch image from URL: {e}'})
        return super().update(instance, validated_data)

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

    def validate(self, data):
        image = data.get('image')
        image_url = data.get('image_url')
        if not image and not image_url:
            raise serializers.ValidationError('Either image file or image_url must be provided.')
        return data

    def create(self, validated_data):
        image_url = validated_data.pop('image_url', None)
        image = validated_data.get('image', None)
        if image_url and not image:
            from django.core.files.base import ContentFile
            import requests
            import os
            try:
                response = requests.get(image_url)
                response.raise_for_status()
                file_name = os.path.basename(image_url.split('?')[0])
                validated_data['image'] = ContentFile(response.content, name=file_name)
            except Exception as e:
                raise serializers.ValidationError({'image_url': f'Failed to fetch image from URL: {e}'})
        return super().create(validated_data)

    def update(self, instance, validated_data):
        image_url = validated_data.pop('image_url', None)
        image = validated_data.get('image', None)
        if image_url and not image:
            from django.core.files.base import ContentFile
            import requests
            import os
            try:
                response = requests.get(image_url)
                response.raise_for_status()
                file_name = os.path.basename(image_url.split('?')[0])
                instance.image.save(file_name, ContentFile(response.content), save=False)
            except Exception as e:
                raise serializers.ValidationError({'image_url': f'Failed to fetch image from URL: {e}'})
        return super().update(instance, validated_data)

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