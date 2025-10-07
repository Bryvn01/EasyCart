from rest_framework import generics, filters, permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
from .mongodb_utils import (
    get_products_from_mongodb,
    get_product_by_id_from_mongodb,
    get_categories_from_mongodb
)
import logging

logger = logging.getLogger(__name__)

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and getattr(request.user, 'is_admin', False)

class CategoryListView(APIView):
    """
    List categories from MongoDB Atlas.
    GET: List categories
    POST: Create category (admin only - not implemented)
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Fetch categories from MongoDB."""
        try:
            categories = get_categories_from_mongodb()
            
            # Transform categories to match expected JSON format
            transformed_categories = []
            for category in categories:
                transformed_category = {
                    'id': category.get('id'),
                    'name': category.get('name'),
                    'description': category.get('description', ''),
                    'slug': category.get('slug', ''),
                }
                transformed_categories.append(transformed_category)
            
            logger.info(f"✅ Returned {len(transformed_categories)} categories")
            
            return Response(transformed_categories, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"❌ Error in CategoryListView: {str(e)}")
            return Response(
                {'error': 'Failed to fetch categories', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProductListView(APIView):
    """
    List products from MongoDB Atlas with filtering, search, and pagination.
    GET: List products
    POST: Create product (admin only)
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Fetch products from MongoDB with filters and pagination."""
        try:
            # Get query parameters
            category = request.query_params.get('category')
            search = request.query_params.get('search')
            ordering = request.query_params.get('ordering', '-createdAt')
            
            # Get pagination parameters
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 20))
            
            # Calculate skip for pagination
            skip = (page - 1) * page_size
            
            # Price range filtering with validation
            price_min = None
            price_max = None
            
            price_min_str = request.query_params.get('price_min')
            if price_min_str:
                try:
                    if price_min_str.lower() not in ['nan', 'inf', '-inf', 'infinity', '-infinity', '+infinity']:
                        price_min_val = float(price_min_str)
                        if price_min_val == price_min_val:  # Check for NaN
                            price_min = price_min_val
                except (ValueError, TypeError, OverflowError):
                    pass  # Skip invalid values
            
            price_max_str = request.query_params.get('price_max')
            if price_max_str:
                try:
                    if price_max_str.lower() not in ['nan', 'inf', '-inf', 'infinity', '-infinity', '+infinity']:
                        price_max_val = float(price_max_str)
                        if price_max_val == price_max_val:  # Check for NaN
                            price_max = price_max_val
                except (ValueError, TypeError, OverflowError):
                    pass  # Skip invalid values
            
            # Fetch products from MongoDB
            products, total_count = get_products_from_mongodb(
                category=category,
                search=search,
                price_min=price_min,
                price_max=price_max,
                ordering=ordering,
                limit=page_size,
                skip=skip
            )
            
            # Transform products to match expected JSON format
            transformed_products = []
            for product in products:
                # Get image URL from either 'image' or 'image_url' field
                image_url = product.get('image_url') or product.get('image', '')
                
                transformed_product = {
                    'id': product.get('id'),
                    'name': product.get('name'),
                    'price': product.get('price'),
                    'description': product.get('description'),
                    'image': image_url,  # Primary field for frontend consumption
                    'image_url': image_url,  # Keep for backward compatibility
                    'category': product.get('category'),
                    'brand': product.get('brand', ''),
                    'stock': product.get('stock', 0),
                    'sku': product.get('sku', ''),
                    'slug': product.get('slug', ''),
                }
                transformed_products.append(transformed_product)
            
            # Build pagination info
            total_pages = (total_count + page_size - 1) // page_size
            
            response_data = {
                'count': total_count,
                'next': page < total_pages,
                'previous': page > 1,
                'results': transformed_products
            }
            
            logger.info(f"✅ Returned {len(transformed_products)} products (page {page}/{total_pages})")
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"❌ Error in ProductListView: {str(e)}")
            return Response(
                {'error': 'Failed to fetch products', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        """Create product (admin only)."""
        if not (request.user.is_authenticated and getattr(request.user, 'is_admin', False)):
            return Response(
                {'error': 'Admin authentication required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            from .mongodb_utils import create_product_in_mongodb
            product_data = request.data
            product_id = create_product_in_mongodb(product_data)
            logger.info(f"✅ Product created with ID: {product_id}")
            return Response(
                {'id': product_id, 'message': 'Product created successfully'},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"❌ Failed to create product: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class ProductDetailView(APIView):
    """
    Retrieve a single product from MongoDB Atlas by ID.
    GET: Retrieve product
    PUT/PATCH: Update product (admin only)
    DELETE: Delete product (admin only)
    """
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        """Fetch single product from MongoDB by ID."""
        try:
            product = get_product_by_id_from_mongodb(str(pk))
            
            if not product:
                return Response(
                    {'error': 'Product not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Transform product to match expected JSON format
            # Get image URL from either 'image' or 'image_url' field
            image_url = product.get('image_url') or product.get('image', '')
            
            transformed_product = {
                'id': product.get('id'),
                'name': product.get('name'),
                'price': product.get('price'),
                'description': product.get('description'),
                'image': image_url,  # Primary field for frontend consumption
                'image_url': image_url,  # Keep for backward compatibility
                'category': product.get('category'),
                'brand': product.get('brand', ''),
                'stock': product.get('stock', 0),
                'sku': product.get('sku', ''),
                'slug': product.get('slug', ''),
            }
            
            logger.info(f"✅ Returned product: {product.get('name')}")
            
            return Response(transformed_product, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"❌ Error in ProductDetailView: {str(e)}")
            return Response(
                {'error': 'Failed to fetch product', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request, pk):
        """Update product (admin only)."""
        if not (request.user.is_authenticated and getattr(request.user, 'is_admin', False)):
            return Response(
                {'error': 'Admin authentication required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            from .mongodb_utils import update_product_in_mongodb
            product_data = request.data
            success = update_product_in_mongodb(str(pk), product_data)
            if success:
                logger.info(f"✅ Product {pk} updated successfully")
                return Response(
                    {'message': 'Product updated successfully'},
                    status=status.HTTP_200_OK
                )
            else:
                logger.warning(f"⚠️ Product {pk} not found")
                return Response(
                    {'error': 'Product not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        except Exception as e:
            logger.error(f"❌ Failed to update product {pk}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def patch(self, request, pk):
        """Partially update product (admin only)."""
        return self.put(request, pk)
    
    def delete(self, request, pk):
        """Delete product (admin only)."""
        if not (request.user.is_authenticated and getattr(request.user, 'is_admin', False)):
            return Response(
                {'error': 'Admin authentication required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            from .mongodb_utils import delete_product_from_mongodb
            success = delete_product_from_mongodb(str(pk))
            if success:
                logger.info(f"✅ Product {pk} deleted successfully")
                return Response(
                    {'message': 'Product deleted successfully'},
                    status=status.HTTP_200_OK
                )
            else:
                logger.warning(f"⚠️ Product {pk} not found")
                return Response(
                    {'error': 'Product not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        except Exception as e:
            logger.error(f"❌ Failed to delete product {pk}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )