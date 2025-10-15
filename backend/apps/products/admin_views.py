from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.db import transaction
from .models import Product, Category, ProductImage
from .serializers import (
    ProductSerializer, ProductCreateUpdateSerializer, CategorySerializer,
    BulkProductUpdateSerializer, ProductImageSerializer
)
from apps.accounts.permissions import IsAdminUser

class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('category').prefetch_related('images', 'reviews')
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active', 'is_featured']
    search_fields = ['name', 'description', 'sku', 'brand']
    ordering_fields = ['name', 'price', 'stock', 'created_at', 'view_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by stock levels
        stock_filter = self.request.query_params.get('stock_filter')
        if stock_filter == 'low':
            queryset = queryset.filter(stock__lte=10, stock__gt=0)
        elif stock_filter == 'out':
            queryset = queryset.filter(stock=0)
        elif stock_filter == 'in':
            queryset = queryset.filter(stock__gt=0)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update multiple products"""
        serializer = BulkProductUpdateSerializer(data=request.data)
        if serializer.is_valid():
            product_ids = serializer.validated_data['product_ids']
            update_data = serializer.validated_data['update_data']
            
            with transaction.atomic():
                updated_count = Product.objects.filter(
                    id__in=product_ids
                ).update(**update_data)
            
            return Response({
                'message': f'Successfully updated {updated_count} products',
                'updated_count': updated_count
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Bulk delete multiple products"""
        product_ids = request.data.get('ids', [])
        if not product_ids:
            return Response(
                {'error': 'No product IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            deleted_count, _ = Product.objects.filter(id__in=product_ids).delete()
        
        return Response({
            'message': f'Successfully deleted {deleted_count} products',
            'deleted_count': deleted_count
        })
    
    @action(detail=True, methods=['patch'])
    def update_stock(self, request, pk=None):
        """Update product stock with operation (set, add, subtract)"""
        product = self.get_object()
        stock_value = request.data.get('stock', 0)
        operation = request.data.get('operation', 'set')  # set, add, subtract
        
        try:
            stock_value = int(stock_value)
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid stock value'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if operation == 'set':
            product.stock = max(0, stock_value)
        elif operation == 'add':
            product.stock = max(0, product.stock + stock_value)
        elif operation == 'subtract':
            product.stock = max(0, product.stock - stock_value)
        else:
            return Response(
                {'error': 'Invalid operation. Use: set, add, or subtract'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product.save(update_fields=['stock'])
        
        return Response({
            'message': 'Stock updated successfully',
            'new_stock': product.stock
        })
    
    @action(detail=False, methods=['get'])
    def inventory_stats(self, request):
        """Get inventory statistics"""
        total_products = Product.objects.count()
        active_products = Product.objects.filter(is_active=True).count()
        low_stock = Product.objects.filter(stock__lte=10, stock__gt=0).count()
        out_of_stock = Product.objects.filter(stock=0).count()
        featured_products = Product.objects.filter(is_featured=True).count()
        
        return Response({
            'total_products': total_products,
            'active_products': active_products,
            'low_stock_products': low_stock,
            'out_of_stock_products': out_of_stock,
            'featured_products': featured_products,
            'categories_count': Category.objects.count()
        })

class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().annotate(
        products_count=Count('products', filter=Q(products__is_active=True))
    )
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'products_count']
    ordering = ['name']
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """Get all products in this category"""
        category = self.get_object()
        products = category.products.filter(is_active=True)
        
        # Apply pagination
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Bulk delete categories (only if they have no products)"""
        category_ids = request.data.get('ids', [])
        if not category_ids:
            return Response(
                {'error': 'No category IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if any categories have products
        categories_with_products = Category.objects.filter(
            id__in=category_ids,
            products__isnull=False
        ).distinct()
        
        if categories_with_products.exists():
            return Response(
                {'error': 'Cannot delete categories that contain products'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            deleted_count, _ = Category.objects.filter(id__in=category_ids).delete()
        
        return Response({
            'message': f'Successfully deleted {deleted_count} categories',
            'deleted_count': deleted_count
        })

class AdminProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset.order_by('order', 'id')
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder product images"""
        image_orders = request.data.get('image_orders', [])
        # image_orders should be [{'id': 1, 'order': 0}, {'id': 2, 'order': 1}, ...]
        
        with transaction.atomic():
            for item in image_orders:
                ProductImage.objects.filter(id=item['id']).update(order=item['order'])
        
        return Response({'message': 'Images reordered successfully'})