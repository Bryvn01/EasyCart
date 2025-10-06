from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import NewsletterSubscription
from .serializers import NewsletterSubscriptionSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def subscribe(request):
    """
    Subscribe to newsletter endpoint.
    Accepts POST { email }
    """
    email = request.data.get('email', '').strip().lower()
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if already subscribed
    if NewsletterSubscription.objects.filter(email=email).exists():
        return Response(
            {'message': 'You are already subscribed to our newsletter!'},
            status=status.HTTP_200_OK
        )
    
    # Create new subscription
    serializer = NewsletterSubscriptionSerializer(data={'email': email})
    if serializer.is_valid():
        serializer.save()
        return Response(
            {'message': 'Successfully subscribed to newsletter!'},
            status=status.HTTP_201_CREATED
        )
    
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )
