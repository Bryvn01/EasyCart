from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import models
from .models import Order
from .serializers import OrderSerializer
import logging

logger = logging.getLogger(__name__)


class AdminOrderViewSet(viewsets.ModelViewSet):
    """Admin-only order management viewset"""

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not (self.request.user.is_admin or self.request.user.is_superuser):
            return Order.objects.none()
        return (
            Order.objects.select_related("user")
            .prefetch_related("items__product")
            .order_by("-created_at")
        )

    def list(self, request, *args, **kwargs):
        """List all orders with filtering"""
        try:
            queryset = self.get_queryset()

            # Filter by status
            status_filter = request.query_params.get("status")
            if status_filter:
                queryset = queryset.filter(status=status_filter)

            # Filter by payment status
            payment_status = request.query_params.get("payment_status")
            if payment_status:
                queryset = queryset.filter(payment_status=payment_status)

            # Search by order ID or user email
            search = request.query_params.get("search")
            if search:
                queryset = queryset.filter(
                    models.Q(id__icontains=search)
                    | models.Q(user__email__icontains=search)
                )

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching orders: {str(e)}")
            return Response(
                {"error": "Failed to fetch orders", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def retrieve(self, request, *args, **kwargs):
        """Get single order details"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching order: {str(e)}")
            return Response(
                {"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def partial_update(self, request, *args, **kwargs):
        """Update order status"""
        try:
            instance = self.get_object()
            new_status = request.data.get("status")

            if new_status:
                instance.status = new_status
                instance.save()
                logger.info(f"Order {instance.id} status updated to {new_status}")

            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error updating order: {str(e)}")
            return Response(
                {"error": "Failed to update order", "detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
