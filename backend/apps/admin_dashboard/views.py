from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from apps.orders.models import Order, OrderItem
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
    
    # Payment method breakdown
    payment_methods = (orders_qs
                      .values('payment_method')
                      .annotate(count=Count('id'), revenue=Sum('total_amount'))
                      .order_by('-count'))
    
    # Payment status breakdown
    payment_status = (orders_qs
                     .values('payment_status')
                     .annotate(count=Count('id'))
                     .order_by('-count'))
    
    # Successful payments (completed)
    completed_payments = orders_qs.filter(payment_status='completed').count()
    failed_payments = orders_qs.filter(payment_status='failed').count()
    pending_payments = orders_qs.filter(payment_status='pending').count()
    
    top_products = (OrderItem.objects
                   .filter(order__created_at__gte=start_date)
                   .values('product__id', 'product__name', 'product__price')
                   .annotate(total_sold=Sum('quantity'))
                   .order_by('-total_sold')[:5])
    
    recent_orders = (Order.objects
                    .select_related('user')
                    .order_by('-created_at')[:10]
                    .values('id', 'total_amount', 'status', 'payment_status', 'payment_method', 'user__email', 'created_at'))
    
    active_customers = User.objects.filter(orders__created_at__gte=start_date).distinct().count()
    
    return Response({
        'totalOrders': total_orders,
        'totalRevenue': float(total_revenue),
        'paymentMethods': list(payment_methods),
        'paymentStatus': list(payment_status),
        'completedPayments': completed_payments,
        'failedPayments': failed_payments,
        'pendingPayments': pending_payments,
        'topProducts': list(top_products),
        'recentOrders': list(recent_orders),
        'customerStats': {'active': active_customers}
    })