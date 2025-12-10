from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count, Avg, F
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from apps.orders.models import Order, OrderItem
from apps.accounts.models import User
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get admin dashboard statistics with accurate calculations.

    Industry Best Practices Applied:
    - Revenue only counts COMPLETED payments (not pending/failed)
    - Conversion rate tracking (completed vs total orders)
    - Average order value calculated from completed orders only
    - Customer lifetime value metrics
    - Payment success rate
    - Caching for performance (5-minute cache)
    """
    if not (request.user.is_authenticated and getattr(request.user, "is_admin", False)):
        logger.warning(
            f"Unauthorized dashboard access attempt by user {request.user.id}"
        )
        return Response(
            {"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN
        )

    try:
        days = int(request.GET.get("days", 30))
        # Validate days parameter
        if days < 1 or days > 3650:  # Max 10 years
            days = 30
    except (ValueError, TypeError):
        days = 30

    # Check cache first (5-minute cache)
    cache_key = f"admin_dashboard_stats_{days}"
    cached_data = cache.get(cache_key)
    if cached_data:
        logger.info(f"Returning cached dashboard stats for {days} days")
        return Response(cached_data)

    start_date = timezone.now() - timedelta(days=days)
    end_date = timezone.now()

    # === CRITICAL: Revenue MUST only count completed payments ===
    # Industry standard: Don't count pending/failed transactions as revenue
    orders_qs = Order.objects.filter(
        created_at__gte=start_date, created_at__lte=end_date
    )
    completed_orders_qs = orders_qs.filter(payment_status="completed")

    total_orders = orders_qs.count()
    completed_orders_count = completed_orders_qs.count()

    # Revenue = SUM of COMPLETED orders only (industry best practice)
    total_revenue = completed_orders_qs.aggregate(total=Sum("total_amount"))[
        "total"
    ] or Decimal("0.00")

    # Payment method breakdown (only completed payments for revenue)
    payment_methods = (
        completed_orders_qs.values("payment_method")
        .annotate(count=Count("id"), revenue=Sum("total_amount"))
        .order_by("-revenue")  # Sort by revenue, not count
    )

    # Payment status breakdown (all orders for visibility)
    payment_status = (
        orders_qs.values("payment_status")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    # Payment status counts
    completed_payments = completed_orders_count
    failed_payments = orders_qs.filter(payment_status="failed").count()
    pending_payments = orders_qs.filter(payment_status="pending").count()
    processing_payments = orders_qs.filter(payment_status="processing").count()

    # === Key Performance Indicators (KPIs) ===
    # Conversion Rate: % of orders that complete payment successfully
    conversion_rate = (
        (completed_payments / total_orders * 100) if total_orders > 0 else 0
    )

    # Payment Success Rate: (completed / (completed + failed)) * 100
    payment_attempts = completed_payments + failed_payments
    payment_success_rate = (
        (completed_payments / payment_attempts * 100) if payment_attempts > 0 else 0
    )

    # Average Order Value (AOV) - only completed orders
    avg_order_value = completed_orders_qs.aggregate(avg=Avg("total_amount"))[
        "avg"
    ] or Decimal("0.00")

    # Top products (only from completed orders)
    top_products = (
        OrderItem.objects.filter(
            order__created_at__gte=start_date,
            order__payment_status="completed",  # Only count sold items from completed orders
        )
        .values("product__id", "product__name", "product__price")
        .annotate(
            total_sold=Sum("quantity"),
            total_revenue=Sum(F("quantity") * F("price")),  # Revenue from this product
        )
        .order_by("-total_revenue")[:5]  # Sort by revenue, not quantity
    )

    # Recent orders (all orders for visibility)
    recent_orders = (
        Order.objects.select_related("user")
        .filter(created_at__gte=start_date)
        .order_by("-created_at")[:10]
        .values(
            "id",
            "total_amount",
            "status",
            "payment_status",
            "payment_method",
            "user__email",
            "user__username",
            "created_at",
        )
    )

    # Customer analytics
    active_customers = (
        User.objects.filter(
            orders__created_at__gte=start_date,
            orders__payment_status="completed",  # Only count customers who completed purchases
        )
        .distinct()
        .count()
    )

    # New customers (first order in this period)
    new_customers = (
        User.objects.filter(orders__created_at__gte=start_date)
        .annotate(first_order=Count("orders"))
        .filter(first_order=1)
        .count()
    )

    # Calculate Customer Lifetime Value (CLV) for active customers
    total_customers = User.objects.filter(orders__isnull=False).distinct().count()
    customer_ltv = float(total_revenue / total_customers) if total_customers > 0 else 0

    # Order status breakdown
    order_status_breakdown = (
        orders_qs.values("status").annotate(count=Count("id")).order_by("-count")
    )

    response_data = {
        # === Core Metrics ===
        "totalOrders": total_orders,
        "completedOrders": completed_orders_count,
        "totalRevenue": float(total_revenue),  # Only completed payments
        "avgOrderValue": float(avg_order_value),
        # === Performance Metrics (Industry Standard) ===
        "conversionRate": round(conversion_rate, 2),  # % of orders completed
        "paymentSuccessRate": round(
            payment_success_rate, 2
        ),  # % of payment attempts successful
        # === Payment Analytics ===
        "paymentMethods": list(payment_methods),
        "paymentStatus": list(payment_status),
        "completedPayments": completed_payments,
        "failedPayments": failed_payments,
        "pendingPayments": pending_payments,
        "processingPayments": processing_payments,
        # === Product Analytics ===
        "topProducts": list(top_products),
        # === Order Analytics ===
        "recentOrders": list(recent_orders),
        "orderStatusBreakdown": list(order_status_breakdown),
        # === Customer Analytics ===
        "customerStats": {
            "active": active_customers,  # Customers with completed orders
            "new": new_customers,
            "total": total_customers,
            "lifetimeValue": round(customer_ltv, 2),
        },
        # === Metadata ===
        "dateRange": {
            "days": days,
            "startDate": start_date.isoformat(),
            "endDate": end_date.isoformat(),
        },
    }

    # Cache for 5 minutes
    cache.set(cache_key, response_data, 300)

    logger.info(
        f"Dashboard stats generated: {days} days, "
        f"{total_orders} orders, "
        f"KES {total_revenue} revenue, "
        f"{conversion_rate:.1f}% conversion"
    )

    return Response(response_data)
