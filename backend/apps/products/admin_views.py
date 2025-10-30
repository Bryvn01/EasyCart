from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.db import transaction
from .models import Product, Category
from .serializers import ProductSerializer, ProductCreateUpdateSerializer, CategorySerializer
from apps.accounts.permissions import IsAdminUser

class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('category')
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active', 'is_featured']
    search_fields = ['name', 'description', 'sku', 'brand']
    ordering_fields = ['name', 'price', 'stock', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        product_ids = request.data.get('ids', [])
        if not product_ids:
            return Response({'error': 'No product IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            deleted_count, _ = Product.objects.filter(id__in=product_ids).delete()
        
        return Response({
            'message': f'Successfully deleted {deleted_count} products',
            'deleted_count': deleted_count
        })
    
    @action(detail=True, methods=['patch'])
    def update_stock(self, request, pk=None):
        product = self.get_object()
        stock_value = int(request.data.get('stock', 0))
        operation = request.data.get('operation', 'set')
        
        if operation == 'set':
            product.stock = max(0, stock_value)
        elif operation == 'add':
            product.stock = max(0, product.stock + stock_value)
        elif operation == 'subtract':
            product.stock = max(0, product.stock - stock_value)
        
        product.save(update_fields=['stock'])
        return Response({'message': 'Stock updated', 'new_stock': product.stock})

class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['name']