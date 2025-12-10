from apps.accounts.permissions import IsRoleOrReadOnly
from .serializers import (
    ProductSerializer,
    CategorySerializer,
    ProductCreateUpdateSerializer,
)
from rest_framework import permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from .models import Product, Category
from .cache import ProductCache
import logging

logger = logging.getLogger(__name__)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and getattr(
            request.user, "is_admin", False
        )


class CategoryListView(APIView):
    """
    List categories from PostgreSQL.
    GET: List categories
    POST: Create category (admin only - not implemented)
    """

    permission_classes = [AllowAny]

    def get(self, request):
        """Fetch categories from PostgreSQL with caching."""
        try:
            # Try cache first
            cached_data = ProductCache.get_categories()
            if cached_data:
                logger.info(f"Returned {len(cached_data)} categories from cache")
                return Response(cached_data, status=status.HTTP_200_OK)

            # Cache miss - fetch from DB with optimized query
            # PERFORMANCE: Use annotate to avoid N+1 queries for products_count
            from django.db.models import Count

            categories = Category.objects.annotate(
                _products_count=Count(
                    "products", filter=models.Q(products__is_active=True)
                )
            ).all()

            serializer = CategorySerializer(
                categories, many=True, context={"request": request}
            )

            # Cache for 1 hour
            ProductCache.set_categories(serializer.data)

            logger.info(f"Returned {len(serializer.data)} categories from PostgreSQL")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in CategoryListView: {str(e)}")
            return Response(
                {"error": "Failed to fetch categories", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ProductListView(APIView):
    """
    List products from PostgreSQL with filtering, search, and pagination.
    GET: List products
    POST: Create product (editor or higher)
    """

    permission_classes = [IsRoleOrReadOnly]
    required_role = "editor"  # Only editors, managers, superadmins can create

    def get(self, request):
        """Fetch products from PostgreSQL with filters, pagination, and caching."""
        try:
            category = request.query_params.get("category")
            search = request.query_params.get("search")
            ordering = request.query_params.get("ordering", "-created_at")
            page = int(request.query_params.get("page", 1))
            page_size = int(request.query_params.get("page_size", 20))

            # Only cache simple category+page queries (no search/filters)
            if (
                not search
                and not request.query_params.get("price_min")
                and not request.query_params.get("price_max")
            ):
                cached_data = ProductCache.get_product_list(category, page)
                if cached_data:
                    logger.info(
                        f"Returned products from cache (category={category}, page={page})"
                    )
                    return Response(cached_data, status=status.HTTP_200_OK)

            # PERFORMANCE: Use select_related to prevent N+1 queries
            queryset = Product.objects.select_related("category").all()
            if category:
                queryset = queryset.filter(category__name__iexact=category)
            if search:
                queryset = queryset.filter(name__icontains=search) | queryset.filter(
                    description__icontains=search
                )
            price_min_str = request.query_params.get("price_min")
            if price_min_str:
                try:
                    if price_min_str.lower() not in [
                        "nan",
                        "inf",
                        "-inf",
                        "infinity",
                        "-infinity",
                        "+infinity",
                    ]:
                        price_min_val = float(price_min_str)
                        if price_min_val == price_min_val:
                            queryset = queryset.filter(price__gte=price_min_val)
                except (ValueError, TypeError, OverflowError):
                    pass
            price_max_str = request.query_params.get("price_max")
            if price_max_str:
                try:
                    if price_max_str.lower() not in [
                        "nan",
                        "inf",
                        "-inf",
                        "infinity",
                        "-infinity",
                        "+infinity",
                    ]:
                        price_max_val = float(price_max_str)
                        if price_max_val == price_max_val:
                            queryset = queryset.filter(price__lte=price_max_val)
                except (ValueError, TypeError, OverflowError):
                    pass
            if ordering:
                ordering_map = {
                    "-createdAt": "-created_at",
                    "createdAt": "created_at",
                    "-price": "-price",
                    "price": "price",
                    "-name": "-name",
                    "name": "name",
                    "-view_count": "-view_count",
                    "view_count": "view_count",
                    "-created_at": "-created_at",
                }
                ordering_field = ordering_map.get(ordering, "-created_at")
                queryset = queryset.order_by(ordering_field)

            # PERFORMANCE: Count before slicing for better query optimization
            total_count = queryset.count()
            start = (page - 1) * page_size
            end = start + page_size

            # PERFORMANCE: Only fetch needed fields, slice the queryset
            products = queryset[start:end]

            # PERFORMANCE: Serialize with context to avoid additional queries
            serializer = ProductSerializer(
                products, many=True, context={"request": request}
            )
            total_pages = (total_count + page_size - 1) // page_size

            # Build pagination URLs following REST best practices
            base_url = request.build_absolute_uri(request.path)
            next_url = None
            previous_url = None

            if page < total_pages:
                # Build next URL with current query params
                from urllib.parse import urlencode

                next_params = request.query_params.copy()
                next_params["page"] = page + 1
                next_url = f"{base_url}?{urlencode(next_params)}"

            if page > 1:
                # Build previous URL with current query params
                from urllib.parse import urlencode

                prev_params = request.query_params.copy()
                prev_params["page"] = page - 1
                previous_url = f"{base_url}?{urlencode(prev_params)}"

            response_data = {
                "count": total_count,
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
                "next": next_url,
                "previous": previous_url,
                "results": serializer.data,
            }

            # Cache simple queries
            if (
                not search
                and not request.query_params.get("price_min")
                and not request.query_params.get("price_max")
            ):
                ProductCache.set_product_list(response_data, category, page)

            logger.info(
                f"Returned {len(serializer.data)} products from PostgreSQL (page {page}/{total_pages})"
            )
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in ProductListView: {str(e)}")
            return Response(
                {"error": "Failed to fetch products", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request):
        """Create product (admin only)."""
        try:
            serializer = ProductCreateUpdateSerializer(data=request.data)
            if serializer.is_valid():
                product = serializer.save()
                logger.info(f"SUCCESS: Product created with ID: {product.id}")
                return Response(
                    ProductSerializer(product).data, status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"ERROR: Failed to create product: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailView(APIView):
    """
    Retrieve a single product from PostgreSQL by ID.
    GET: Retrieve product
    PUT/PATCH: Update product (editor or higher)
    DELETE: Delete product (editor or higher)
    """

    permission_classes = [IsRoleOrReadOnly]
    required_role = "editor"  # Only editors, managers, superadmins can update/delete

    def get(self, request, pk):
        """Fetch single product from PostgreSQL by ID with caching."""
        try:
            # Try cache first
            cached_data = ProductCache.get_product_detail(pk)
            if cached_data:
                logger.info(f"Returned product {pk} from cache")
                return Response(cached_data, status=status.HTTP_200_OK)

            # Cache miss - fetch from DB
            product = Product.objects.filter(id=pk).first()
            if not product:
                return Response(
                    {"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND
                )

            serializer = ProductSerializer(product)

            # Cache for 30 minutes
            ProductCache.set_product_detail(pk, serializer.data)

            logger.info(f"SUCCESS: Returned product: {product.name}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"ERROR: Error in ProductDetailView: {str(e)}")
            return Response(
                {"error": "Failed to fetch product", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def put(self, request, pk):
        """Update product (admin only)."""
        try:
            product = Product.objects.filter(id=pk).first()
            if not product:
                return Response(
                    {"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND
                )
            serializer = ProductCreateUpdateSerializer(
                product, data=request.data, partial=False
            )
            if serializer.is_valid():
                product = serializer.save()
                # Invalidate cache
                ProductCache.invalidate_product(pk)
                logger.info(f"SUCCESS: Product {pk} updated successfully")
                return Response(
                    ProductSerializer(product).data, status=status.HTTP_200_OK
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"ERROR: Failed to update product {pk}: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        """Partially update product (admin only)."""
        try:
            product = Product.objects.filter(id=pk).first()
            if not product:
                return Response(
                    {"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND
                )
            serializer = ProductCreateUpdateSerializer(
                product, data=request.data, partial=True
            )
            if serializer.is_valid():
                product = serializer.save()
                # Invalidate cache
                ProductCache.invalidate_product(pk)
                logger.info(f"SUCCESS: Product {pk} updated successfully")
                return Response(
                    ProductSerializer(product).data, status=status.HTTP_200_OK
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"ERROR: Failed to update product {pk}: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete product (admin only)."""
        try:
            product = Product.objects.filter(id=pk).first()
            if not product:
                return Response(
                    {"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND
                )
            product_name = product.name
            product.delete()
            # Invalidate cache
            ProductCache.invalidate_product(pk)
            logger.info(f"SUCCESS: Product {pk} ({product_name}) deleted successfully")
            return Response(
                {"message": "Product deleted successfully"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"ERROR: Failed to delete product {pk}: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ImageUploadView(APIView):
    """
    Upload product image to Cloudinary.
    POST: Upload image (admin only)
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Upload image to Cloudinary and return URL."""
        try:
            if not request.user.is_admin and not request.user.is_superuser:
                return Response(
                    {"error": "Admin privileges required"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if "image" not in request.FILES:
                return Response(
                    {"error": "No image file provided"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            image_file = request.FILES["image"]

            # Validate file size (max 5MB)
            if image_file.size > 5 * 1024 * 1024:
                return Response(
                    {"error": "Image size must be less than 5MB"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate file type
            allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
            if image_file.content_type not in allowed_types:
                return Response(
                    {"error": "Only JPEG, PNG, and WebP images are allowed"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Upload to Cloudinary
            import cloudinary.uploader

            result = cloudinary.uploader.upload(
                image_file,
                folder="products",
                transformation=[
                    {"width": 800, "height": 800, "crop": "limit"},
                    {"quality": "auto:good"},
                ],
            )

            logger.info(f"Image uploaded successfully: {result['secure_url']}")
            return Response(
                {"url": result["secure_url"], "public_id": result["public_id"]},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Image upload failed: {str(e)}")
            return Response(
                {"error": "Image upload failed", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
