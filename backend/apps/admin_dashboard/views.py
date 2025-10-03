from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from apps.orders.models import Order, OrderItem
from apps.orders.serializers import OrderSerializer
from apps.orders.email_service import EmailService
from apps.accounts.models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    if not (request.user.is_authenticated and getattr(request.user, 'is_admin', False)):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    days = int(request.GET.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)
    
    orders_qs = Order.objects.filter(created_at__gte=start_date)
    total_orders = orders_qs.count()
    total_revenue = orders_qs.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    
    top_products = (OrderItem.objects
                   .filter(order__created_at__gte=start_date)
                   .values('product__id', 'product__name', 'product__price')
                   .annotate(total_sold=Sum('quantity'))
                   .order_by('-total_sold')[:5])
    
    recent_orders = (Order.objects
                    .select_related('user')
                    .order_by('-created_at')[:10]
                    .values('id', 'total_amount', 'status', 'user__email'))
    
    active_customers = User.objects.filter(orders__created_at__gte=start_date).distinct().count()
    
    return Response({
        'totalOrders': total_orders,
        'totalRevenue': float(total_revenue),
        'topProducts': list(top_products),
        'recentOrders': list(recent_orders),
        'customerStats': {'active': active_customers}
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_orders_list(request):
    """Admin endpoint to list all orders with filtering"""
    if not (request.user.is_authenticated and getattr(request.user, 'is_admin', False)):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    orders = Order.objects.select_related('user').prefetch_related('items__product').all()
    
    # Filter by status
    status_filter = request.GET.get('status')
    if status_filter:
        orders = orders.filter(status=status_filter)
    
    # Filter by payment status
    payment_status_filter = request.GET.get('payment_status')
    if payment_status_filter:
        orders = orders.filter(payment_status=payment_status_filter)
    
    # Filter by date range
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    if start_date:
        orders = orders.filter(created_at__gte=start_date)
    if end_date:
        orders = orders.filter(created_at__lte=end_date)
    
    # Search by customer email or order ID
    search = request.GET.get('search')
    if search:
        orders = orders.filter(
            Q(user__email__icontains=search) |
            Q(user__username__icontains=search) |
            Q(id__icontains=search)
        )
    
    # Order by created date (newest first)
    orders = orders.order_by('-created_at')
    
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_order_detail(request, order_id):
    """Admin endpoint to get detailed order information"""
    if not (request.user.is_authenticated and getattr(request.user, 'is_admin', False)):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        order = Order.objects.select_related('user').prefetch_related('items__product').get(id=order_id)
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_update_order_status(request, order_id):
    """Admin endpoint to update order status"""
    if not (request.user.is_authenticated and getattr(request.user, 'is_admin', False)):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        order = Order.objects.get(id=order_id)
        old_status = order.status
        new_status = request.data.get('status')
        
        if not new_status:
            return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = new_status
        order.save()
        
        # Send email notification if status changed
        if old_status != new_status:
            EmailService.send_order_status_update(order, old_status, new_status)
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)