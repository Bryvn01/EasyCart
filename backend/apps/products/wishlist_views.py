from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.html import escape
import re
from .wishlist_models import Wishlist, WishlistItem
from .models import Product
from .wishlist_serializers import WishlistSerializer, WishlistItemSerializer

class WishlistView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WishlistSerializer
    
    def get_object(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    wishlist, created = Wishlist.objects.get_or_create(user=request.user)
    
    # Sanitize product_id to prevent path traversal
    raw_product_id = str(request.data.get('product_id', ''))
    product_id = re.sub(r'[.]{2,}|[/\\]|%2e|%2f|%5c', '', escape(raw_product_id))
    
    if not product_id:
        return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if item already exists in wishlist
    if WishlistItem.objects.filter(wishlist=wishlist, product=product).exists():
        return Response({'error': 'Product already in wishlist'}, status=status.HTTP_400_BAD_REQUEST)
    
    wishlist_item = WishlistItem.objects.create(wishlist=wishlist, product=product)
    serializer = WishlistItemSerializer(wishlist_item)
    
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, item_id):
    wishlist = get_object_or_404(Wishlist, user=request.user)
    
    # Sanitize item_id to prevent path traversal
    safe_item_id = re.sub(r'[.]{2,}|[/\\]|%2e|%2f|%5c', '', escape(str(item_id)))
    
    wishlist_item = get_object_or_404(WishlistItem, id=safe_item_id, wishlist=wishlist)
    wishlist_item.delete()
    
    return Response({'message': 'Item removed from wishlist'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_wishlist_status(request, product_id):
    wishlist, created = Wishlist.objects.get_or_create(user=request.user)
    
    # Sanitize product_id to prevent path traversal
    safe_product_id = re.sub(r'[.]{2,}|[/\\]|%2e|%2f|%5c', '', escape(str(product_id)))
    
    try:
        product = Product.objects.get(id=safe_product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    is_in_wishlist = WishlistItem.objects.filter(wishlist=wishlist, product=product).exists()
    
    return Response({'is_in_wishlist': is_in_wishlist}, status=status.HTTP_200_OK)
