from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer
import logging

logger = logging.getLogger(__name__)


class CustomerViewSet(viewsets.ModelViewSet):
    """Admin-only customer management viewset"""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not (self.request.user.is_admin or self.request.user.is_superuser):
            return User.objects.none()
        return User.objects.all().order_by("-date_joined")

    def list(self, request, *args, **kwargs):
        """List all customers"""
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching customers: {str(e)}")
            return Response(
                {"error": "Failed to fetch customers"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def retrieve(self, request, *args, **kwargs):
        """Get single customer"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching customer: {str(e)}")
            return Response(
                {"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def partial_update(self, request, *args, **kwargs):
        """Update customer details"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                logger.info(f"Customer {instance.id} updated successfully")
                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error updating customer: {str(e)}")
            return Response(
                {"error": "Failed to update customer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def destroy(self, request, *args, **kwargs):
        """Deactivate customer (soft delete)"""
        try:
            instance = self.get_object()
            instance.is_active = False
            instance.save()
            logger.info(f"Customer {instance.id} deactivated")
            return Response(
                {"message": "Customer deactivated successfully"},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error(f"Error deactivating customer: {str(e)}")
            return Response(
                {"error": "Failed to deactivate customer"},
                status=status.HTTP_400_BAD_REQUEST,
            )
