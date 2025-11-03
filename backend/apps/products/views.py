from apps.accounts.permissions import IsRoleOrReadOnly
from .serializers import ProductSerializer, CategorySerializer, ProductCreateUpdateSerializer
from rest_framework import generics, filters, permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
import logging

logger = logging.getLogger(__name__)

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and getattr(request.user, 'is_admin', False)

class CategoryListView(APIView):
    """
    List categories from PostgreSQL.
    GET: List categories
    POST: Create category (admin only - not implemented)
    """
    permission_classes = [AllowAny]

    def get(self, request):
        """Fetch categories from PostgreSQL."""
        try:
            categories = Category.objects.all()
            serializer = CategorySerializer(categories, many=True)
            logger.info(f"Returned {len(serializer.data)} categories from PostgreSQL")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in CategoryListView: {str(e)}")
            return Response(
                {'error': 'Failed to fetch categories', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProductListView(APIView):
    """
    List products from PostgreSQL with filtering, search, and pagination.
    GET: List products
    POST: Create product (editor or higher)
    """
    permission_classes = [IsRoleOrReadOnly]
    required_role = 'editor'  # Only editors, managers, superadmins can create

    def get(self, request):
        """Fetch products from PostgreSQL with filters and pagination."""
        try:
            queryset = Product.objects.all()
            category = request.query_params.get('category')
            search = request.query_params.get('search')
            ordering = request.query_params.get('ordering', '-created_at')
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 20))
            if category:
                queryset = queryset.filter(category__name__iexact=category)
            if search:
                queryset = queryset.filter(name__icontains=search) | queryset.filter(description__icontains=search)
            price_min_str = request.query_params.get('price_min')
            if price_min_str:
                try:
                    if price_min_str.lower() not in ['nan', 'inf', '-inf', 'infinity', '-infinity', '+infinity']:
                        price_min_val = float(price_min_str)
                        if price_min_val == price_min_val:
                            queryset = queryset.filter(price__gte=price_min_val)
                except (ValueError, TypeError, OverflowError):
                    pass
            price_max_str = request.query_params.get('price_max')
            if price_max_str:
                try:
                    if price_max_str.lower() not in ['nan', 'inf', '-inf', 'infinity', '-infinity', '+infinity']:
                        price_max_val = float(price_max_str)
                        if price_max_val == price_max_val:
                            queryset = queryset.filter(price__lte=price_max_val)
                except (ValueError, TypeError, OverflowError):
                    pass
            if ordering:
                ordering_map = {
                    '-createdAt': '-created_at',
                    'createdAt': 'created_at',
                    '-price': '-price',
                    'price': 'price',
                    '-name': '-name',
                    'name': 'name',
                }
                ordering_field = ordering_map.get(ordering, '-created_at')
                queryset = queryset.order_by(ordering_field)
            total_count = queryset.count()
            start = (page - 1) * page_size
            end = start + page_size
            products = queryset[start:end]
            serializer = ProductSerializer(products, many=True)
            total_pages = (total_count + page_size - 1) // page_size
            response_data = {
                'count': total_count,
                'next': page < total_pages,
                'previous': page > 1,
                'results': serializer.data
            }
            logger.info(f"Returned {len(serializer.data)} products from PostgreSQL (page {page}/{total_pages})")
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in ProductListView: {str(e)}")
            return Response(
                {'error': 'Failed to fetch products', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """Create product (admin only)."""
        try:
            serializer = ProductCreateUpdateSerializer(data=request.data)
            if serializer.is_valid():
                product = serializer.save()
                logger.info(f"SUCCESS: Product created with ID: {product.id}")
                return Response(
                    ProductSerializer(product).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"ERROR: Failed to create product: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProductDetailView(APIView):
    """
    Retrieve a single product from PostgreSQL by ID.
    GET: Retrieve product
    PUT/PATCH: Update product (editor or higher)
    DELETE: Delete product (editor or higher)
    """
    permission_classes = [IsRoleOrReadOnly]
    required_role = 'editor'  # Only editors, managers, superadmins can update/delete

    def get(self, request, pk):
        """Fetch single product from PostgreSQL by ID."""
        try:
            product = Product.objects.filter(id=pk).first()
            if not product:
                return Response(
                    {'error': 'Product not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = ProductSerializer(product)
            logger.info(f"SUCCESS: Returned product: {product.name}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"ERROR: Error in ProductDetailView: {str(e)}")
            return Response(
                {'error': 'Failed to fetch product', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, pk):
        """Update product (admin only)."""
        try:
            product = Product.objects.filter(id=pk).first()
            if not product:
                return Response(
                    {'error': 'Product not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = ProductCreateUpdateSerializer(product, data=request.data, partial=False)
            if serializer.is_valid():
                product = serializer.save()
                logger.info(f"SUCCESS: Product {pk} updated successfully")
                return Response(ProductSerializer(product).data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"ERROR: Failed to update product {pk}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def patch(self, request, pk):
        """Partially update product (admin only)."""
        try:
            product = Product.objects.filter(id=pk).first()
            if not product:
                return Response(
                    {'error': 'Product not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = ProductCreateUpdateSerializer(product, data=request.data, partial=True)
            if serializer.is_valid():
                product = serializer.save()
                logger.info(f"SUCCESS: Product {pk} updated successfully")
                return Response(ProductSerializer(product).data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"ERROR: Failed to update product {pk}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, pk):
        """Delete product (admin only)."""
        try:
            product = Product.objects.filter(id=pk).first()
            if not product:
                return Response(
                    {'error': 'Product not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            product_name = product.name
            product.delete()
            logger.info(f"SUCCESS: Product {pk} ({product_name}) deleted successfully")
            return Response(
                {'message': 'Product deleted successfully'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"ERROR: Failed to delete product {pk}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
