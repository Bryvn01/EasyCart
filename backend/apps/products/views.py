from rest_framework import generics, filters, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and getattr(request.user, 'is_admin', False)

class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class ProductListView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at', 'view_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Product.objects.all() if (self.request.user.is_authenticated and getattr(self.request.user, 'is_admin', False)) else Product.objects.filter(is_active=True)
        
        # Price range filtering
        price_min = self.request.query_params.get('price_min')
        price_max = self.request.query_params.get('price_max')
        
        if price_min:
            try:
                # Skip filtering if value is invalid (NaN, inf, infinity, etc.)
                if price_min.lower() in ['nan', 'inf', '-inf', 'infinity', '-infinity', '+infinity']:
                    pass  # Skip this filter
                else:
                    price_min_val = float(price_min)
                    # Additional check for NaN after conversion
                    if price_min_val == price_min_val:  # This will be False for NaN
                        queryset = queryset.filter(price__gte=price_min_val)
            except (ValueError, TypeError, OverflowError):
                pass  # Skip invalid values

        if price_max:
            try:
                # Skip filtering if value is invalid (NaN, inf, infinity, etc.)
                if price_max.lower() in ['nan', 'inf', '-inf', 'infinity', '-infinity', '+infinity']:
                    pass  # Skip this filter
                else:
                    price_max_val = float(price_max)
                    # Additional check for NaN after conversion
                    if price_max_val == price_max_val:  # This will be False for NaN
                        queryset = queryset.filter(price__lte=price_max_val)
            except (ValueError, TypeError, OverflowError):
                pass  # Skip invalid values
                
        return queryset

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]