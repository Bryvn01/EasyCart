from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.html import escape
import re
from .review_models import Review, ReviewHelpful
from .review_serializers import ReviewSerializer, ReviewCreateSerializer, ReviewHelpfulSerializer
from apps.products.models import Product

class ReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return Review.objects.filter(product_id=product_id).order_by('-created_at')

class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_review_helpful(request):
    review_id = request.data.get('review_id')
    is_helpful = request.data.get('is_helpful', True)
    
    # Validate review_id is numeric
    try:
        review_id = int(review_id)
    except (ValueError, TypeError):
        return Response({'error': 'Invalid review ID'}, status=status.HTTP_400_BAD_REQUEST)
    
    review = get_object_or_404(Review, id=review_id)
    
    helpful_vote, created = ReviewHelpful.objects.get_or_create(
        review=review,
        user=request.user,
        defaults={'is_helpful': is_helpful}
    )
    
    if not created:
        helpful_vote.is_helpful = is_helpful
        helpful_vote.save()
    
    serializer = ReviewHelpfulSerializer(helpful_vote)
    return Response(serializer.data, status=status.HTTP_200_OK)
