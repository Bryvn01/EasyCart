from rest_framework import generics, filters, permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import DatabaseError
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
import logging
import traceback

logger = logging.getLogger(__name__)

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and getattr(request.user, 'is_admin', False)

class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsAdminOrReadOnly()]
    
    def list(self, request, *args, **kwargs):
        """
        Override list method to add comprehensive error handling
        """
        try:
            logger.info("Categories list endpoint accessed")
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            logger.info(f"Successfully serialized {len(serializer.data)} categories")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DatabaseError as e:
            logger.error(f"Database error in categories list: {e}", exc_info=True)
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {
                    'error': 'Database connection error',
                    'message': 'Unable to connect to the database. Please try again later.'
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            logger.error(f"Unexpected error in categories list: {e}", exc_info=True)
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {'error': 'Internal server error', 'message': 'An unexpected error occurred.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProductListView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsAdminOrReadOnly()]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at', 'view_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Get product queryset with comprehensive error handling
        Returns all active products for non-admin users
        """
        try:
            # Determine base queryset based on user authentication
            if self.request.user.is_authenticated and getattr(self.request.user, 'is_admin', False):
                queryset = Product.objects.all()
                logger.info("Admin user accessing all products")
            else:
                queryset = Product.objects.filter(is_active=True)
                logger.info("Regular user accessing active products")
            
            # Price range filtering with validation
            price_min = self.request.query_params.get('price_min')
            price_max = self.request.query_params.get('price_max')
            
            if price_min:
                try:
                    # Skip filtering if value is invalid (NaN, inf, infinity, etc.)
                    if price_min.lower() in ['nan', 'inf', '-inf', 'infinity', '-infinity', '+infinity']:
                        logger.warning(f"Invalid price_min value received: {price_min}")
                    else:
                        price_min_val = float(price_min)
                        # Additional check for NaN after conversion
                        if price_min_val == price_min_val:  # This will be False for NaN
                            queryset = queryset.filter(price__gte=price_min_val)
                            logger.debug(f"Applied price_min filter: {price_min_val}")
                except (ValueError, TypeError, OverflowError) as e:
                    logger.warning(f"Failed to parse price_min '{price_min}': {e}")

            if price_max:
                try:
                    # Skip filtering if value is invalid (NaN, inf, infinity, etc.)
                    if price_max.lower() in ['nan', 'inf', '-inf', 'infinity', '-infinity', '+infinity']:
                        logger.warning(f"Invalid price_max value received: {price_max}")
                    else:
                        price_max_val = float(price_max)
                        # Additional check for NaN after conversion
                        if price_max_val == price_max_val:  # This will be False for NaN
                            queryset = queryset.filter(price__lte=price_max_val)
                            logger.debug(f"Applied price_max filter: {price_max_val}")
                except (ValueError, TypeError, OverflowError) as e:
                    logger.warning(f"Failed to parse price_max '{price_max}': {e}")
                    
            return queryset
            
        except DatabaseError as e:
            logger.error(f"Database error in get_queryset: {e}", exc_info=True)
            logger.error(f"Traceback: {traceback.format_exc()}")
            # Return empty queryset instead of raising exception
            return Product.objects.none()
        except Exception as e:
            logger.error(f"Unexpected error in get_queryset: {e}", exc_info=True)
            logger.error(f"Traceback: {traceback.format_exc()}")
            # Return empty queryset instead of raising exception
            return Product.objects.none()
    
    def list(self, request, *args, **kwargs):
        """
        Override list method to add comprehensive error handling
        Ensures API always returns valid JSON response
        """
        try:
            logger.info(f"Products list endpoint accessed by {request.user if request.user.is_authenticated else 'anonymous'}")
            
            # Get queryset with error handling
            queryset = self.filter_queryset(self.get_queryset())
            
            # Get page and serialize data
            page = self.paginate_queryset(queryset)
            if page is not None:
                try:
                    serializer = self.get_serializer(page, many=True)
                    logger.info(f"Successfully serialized {len(page)} products (paginated)")
                    return self.get_paginated_response(serializer.data)
                except Exception as e:
                    logger.error(f"Serialization error (paginated): {e}", exc_info=True)
                    logger.error(f"Traceback: {traceback.format_exc()}")
                    # Return empty paginated response on serialization error
                    return self.get_paginated_response([])
            
            # Non-paginated response
            try:
                serializer = self.get_serializer(queryset, many=True)
                count = len(serializer.data)
                logger.info(f"Successfully serialized {count} products (non-paginated)")
                
                # Ensure we return a proper response even if count is 0
                if count == 0:
                    logger.info("No products found, returning empty list")
                
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Serialization error (non-paginated): {e}", exc_info=True)
                logger.error(f"Traceback: {traceback.format_exc()}")
                # Return empty list on serialization error
                return Response([], status=status.HTTP_200_OK)
                
        except DatabaseError as e:
            logger.error(f"Database error in list method: {e}", exc_info=True)
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {
                    'error': 'Database connection error',
                    'message': 'Unable to connect to the database. Please try again later.',
                    'details': None  # Do not expose exception details to external clients
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            logger.error(f"Unexpected error in list method: {e}", exc_info=True)
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {
                    'error': 'Internal server error',
                    'message': 'An unexpected error occurred while fetching products.',
                    'details': None  # Do not expose exception details to external clients
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def retrieve(self, request, *args, **kwargs):
        """
        Override retrieve method to add comprehensive error handling
        """
        try:
            logger.info(f"Product detail endpoint accessed for pk={kwargs.get('pk')}")
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Product.DoesNotExist:
            logger.warning(f"Product not found: pk={kwargs.get('pk')}")
            return Response(
                {'error': 'Product not found', 'message': 'The requested product does not exist.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except DatabaseError as e:
            logger.error(f"Database error in retrieve method: {e}", exc_info=True)
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {
                    'error': 'Database connection error',
                    'message': 'Unable to connect to the database. Please try again later.',
                    'details': str(e) if request.user.is_authenticated and getattr(request.user, 'is_admin', False) else None
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            logger.error(f"Unexpected error in retrieve method: {e}", exc_info=True)
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {
                    'error': 'Internal server error',
                    'message': 'An unexpected error occurred while fetching the product.',
                    'details': str(e) if request.user.is_authenticated and getattr(request.user, 'is_admin', False) else None
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )