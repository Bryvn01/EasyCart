from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from django.db.models import Sum, Count, Avg
from django.db.models.functions import ExtractHour, TruncDate
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import timedelta
from decimal import Decimal

from .permissions import IsPOSStaff
from apps.pos.models import (
    POSSession,
    POSTransaction,
    POSTransactionItem,
    POSStaffPermission,
    POSDiscount,
)
from apps.pos.serializers import (
    POSSessionSerializer,
    POSTransactionSerializer,
    POSStaffPermissionSerializer,
    POSDiscountSerializer,
    ProductQuickSearchSerializer,
    POSDashboardStatsSerializer,
)
from apps.pos.permissions import (
    CanOpenSession,
    CanCloseSession,
    CanVoidTransaction,
    CanProcessRefund,
    CanViewReports,
)
from apps.products.models import Product


# Custom API root view for POS endpoints
class PosAPIRootView(APIView):
    permission_classes = [IsAuthenticated, IsPOSStaff]

    def get(self, request, format=None):
        return Response({"detail": "POS API root. Access restricted to POS staff."})


class POSSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing POS sessions."""

    # Remove manual permission check; rely on DRF permission_classes and get_permissions

    queryset = POSSession.objects.all()
    serializer_class = POSSessionSerializer
    permission_classes = [IsAuthenticated, IsPOSStaff]
    filterset_fields = ["staff", "status"]
    search_fields = ["session_number", "staff__username"]
    ordering_fields = ["opened_at", "closed_at", "total_sales"]
    ordering = ["-opened_at"]

    def get_queryset(self):
        """Filter sessions based on user role."""
        user = self.request.user
        if user.is_superuser:
            return POSSession.objects.all()
        return POSSession.objects.filter(staff=user)

    def get_permissions(self):
        """Apply best-practice permissions for all POS endpoints."""
        # Only POS staff can access any POS endpoint by default
        if self.action == "create":
            return [IsAuthenticated(), IsPOSStaff(), CanOpenSession()]
        elif self.action in ["close_session", "reconcile"]:
            return [IsAuthenticated(), IsPOSStaff(), CanCloseSession()]
        # Enforce IsAuthenticated and IsPOSStaff for all other actions (list, retrieve, etc.)
        return [IsAuthenticated(), IsPOSStaff()]

    def create(self, request, *args, **kwargs):
        """Open a new POS session."""
        # Check if user already has an open session
        existing_session = POSSession.objects.filter(
            staff=request.user, status="open"
        ).first()

        if existing_session:
            return Response(
                {
                    "error": "You already have an open session",
                    "session": POSSessionSerializer(existing_session).data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create new session
        request.data["staff"] = request.user.id
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def close_session(self, request, pk=None):
        """Close a POS session."""
        session = self.get_object()

        if session.status != "open":
            return Response(
                {"error": "Session is not open"}, status=status.HTTP_400_BAD_REQUEST
            )

        if session.staff != request.user and not request.user.is_superuser:
            return Response(
                {"error": "You can only close your own session"},
                status=status.HTTP_403_FORBIDDEN,
            )

        closing_cash = Decimal(request.data.get("closing_cash", 0))
        closing_notes = request.data.get("closing_notes", "")

        session.close_session(closing_cash, closing_notes)

        return Response(
            {
                "message": "Session closed successfully",
                "session": POSSessionSerializer(session).data,
            }
        )

    @action(detail=True, methods=["post"])
    def reconcile(self, request, pk=None):
        """Mark session as reconciled."""
        session = self.get_object()

        if session.status != "closed":
            return Response(
                {"error": "Session must be closed before reconciliation"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.status = "reconciled"
        session.save()

        return Response(
            {
                "message": "Session reconciled successfully",
                "session": POSSessionSerializer(session).data,
            }
        )

    @action(detail=True, methods=["get"])
    def summary(self, request, pk=None):
        """Get detailed session summary."""
        session = self.get_object()

        # Get payment method breakdown
        payment_breakdown = (
            session.transactions.filter(status="completed")
            .values("payment_method")
            .annotate(total=Sum("total_amount"), count=Count("id"))
        )

        # Get hourly sales (safe, no .extra)
        hourly_sales = (
            session.transactions.filter(status="completed")
            .annotate(hour=ExtractHour("created_at"))
            .values("hour")
            .annotate(total=Sum("total_amount"), count=Count("id"))
            .order_by("hour")
        )

        return Response(
            {
                "session": POSSessionSerializer(session).data,
                "payment_breakdown": list(payment_breakdown),
                "hourly_sales": list(hourly_sales),
            }
        )

    @action(detail=False, methods=["get"])
    def current(self, request):
        """Get current user's active session."""
        session = POSSession.objects.filter(staff=request.user, status="open").first()

        if not session:
            return Response(
                {"error": "No active session found"}, status=status.HTTP_404_NOT_FOUND
            )

        return Response(POSSessionSerializer(session).data)


class POSTransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing POS transactions.
    """

    queryset = POSTransaction.objects.all()
    serializer_class = POSTransactionSerializer
    permission_classes = [IsAuthenticated, IsPOSStaff]
    filterset_fields = ["session", "status", "payment_method", "customer"]
    search_fields = ["transaction_number", "customer_name", "customer_phone"]
    ordering_fields = ["created_at", "total_amount"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Filter transactions based on user and query params."""
        queryset = POSTransaction.objects.select_related("session", "customer")
        user = self.request.user

        # Filter by date range if provided
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)

        # Non-superusers can only see their own transactions
        if not user.is_superuser:
            queryset = queryset.filter(session__staff=user)

        return queryset

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        """Complete a transaction."""
        transaction = self.get_object()

        if transaction.status != "pending":
            return Response(
                {"error": "Transaction is not pending"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        amount_paid = Decimal(request.data.get("amount_paid", 0))

        if amount_paid < transaction.total_amount:
            return Response(
                {"error": "Insufficient payment amount"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        transaction.complete_transaction(amount_paid)

        return Response(
            {
                "message": "Transaction completed successfully",
                "transaction": POSTransactionSerializer(transaction).data,
            }
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated, IsPOSStaff, CanVoidTransaction],
    )
    def void(self, request, pk=None):
        """Void/cancel a transaction."""
        transaction = self.get_object()

        if transaction.status == "completed":
            # Check if transaction is recent (within configured time limit)
            time_limit = timezone.now() - timedelta(hours=24)
            if transaction.completed_at < time_limit:
                return Response(
                    {"error": "Transaction too old to void"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        reason = request.data.get("reason", "")
        transaction.cancel_transaction(reason)

        return Response(
            {
                "message": "Transaction voided successfully",
                "transaction": POSTransactionSerializer(transaction).data,
            }
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated, IsPOSStaff, CanProcessRefund],
    )
    def refund(self, request, pk=None):
        """Process a refund for a transaction."""
        transaction = self.get_object()

        if transaction.status != "completed":
            return Response(
                {"error": "Can only refund completed transactions"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = request.data.get("reason", "")
        transaction.status = "refunded"
        transaction.notes = f"{transaction.notes}\nRefund reason: {reason}".strip()
        transaction.save()

        # Inventory restoration handled by signals

        return Response(
            {
                "message": "Refund processed successfully",
                "transaction": POSTransactionSerializer(transaction).data,
            }
        )

    @action(detail=True, methods=["post"])
    def print_receipt(self, request, pk=None):
        """Mark receipt as printed."""
        transaction = self.get_object()
        transaction.receipt_printed = True
        transaction.save()

        # Update receipt print count if exists
        if hasattr(transaction, "receipt"):
            receipt = transaction.receipt
            receipt.printed_count += 1
            receipt.last_printed_at = timezone.now()
            receipt.save()

        return Response({"message": "Receipt marked as printed"})

    @action(detail=True, methods=["post"])
    def email_receipt(self, request, pk=None):
        """Send receipt via email."""
        transaction = self.get_object()

        email = request.data.get("email", transaction.customer_email)
        if not email:
            return Response(
                {"error": "Email address required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # TODO: Implement email sending logic
        transaction.receipt_emailed = True
        transaction.save()

        return Response({"message": f"Receipt sent to {email}"})


class POSProductSearchViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Fast product search for POS operations.
    """

    queryset = Product.objects.filter(is_active=True, stock__gt=0)
    serializer_class = ProductQuickSearchSerializer
    permission_classes = [IsAuthenticated, IsPOSStaff]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "sku", "category__name"]

    def get_queryset(self):
        """Optimize queryset for POS."""
        return (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .only("id", "name", "sku", "price", "stock", "image_url", "category")
        )

    @action(detail=False, methods=["get"])
    def barcode(self, request):
        """Search product by barcode/SKU."""
        sku = request.query_params.get("sku")
        if not sku:
            return Response(
                {"error": "SKU parameter required"}, status=status.HTTP_400_BAD_REQUEST
            )

        product = get_object_or_404(Product, sku=sku, is_active=True)
        return Response(ProductQuickSearchSerializer(product).data)


class POSDiscountViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing POS discounts.
    """

    queryset = POSDiscount.objects.all()
    serializer_class = POSDiscountSerializer
    permission_classes = [IsAuthenticated, IsPOSStaff]
    filterset_fields = ["is_active", "discount_type"]
    search_fields = ["name", "code"]
    ordering = ["name"]

    @action(detail=False, methods=["post"])
    def validate_code(self, request):
        """Validate a discount code."""
        code = request.data.get("code")
        subtotal = Decimal(request.data.get("subtotal", 0))

        if not code:
            return Response(
                {"error": "Discount code required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            discount = POSDiscount.objects.get(code=code.upper())
        except POSDiscount.DoesNotExist:
            return Response(
                {"error": "Invalid discount code"}, status=status.HTTP_404_NOT_FOUND
            )

        if not discount.is_valid():
            return Response(
                {"error": "Discount code is not valid or has expired"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        discount_amount = discount.calculate_discount(subtotal)

        return Response(
            {
                "valid": True,
                "discount": POSDiscountSerializer(discount).data,
                "discount_amount": discount_amount,
            }
        )


class POSStaffPermissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing staff POS permissions.
    """

    queryset = POSStaffPermission.objects.all()
    serializer_class = POSStaffPermissionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["staff", "permission"]
    ordering = ["staff__username", "permission"]

    def perform_create(self, serializer):
        """Set granted_by when creating permission."""
        serializer.save(granted_by=self.request.user)


class POSDashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for POS dashboard analytics and reports.
    """

    permission_classes = [IsAuthenticated, IsPOSStaff, CanViewReports]

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get POS dashboard statistics."""
        # Date filters
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        staff_id = request.query_params.get("staff")

        # Base queryset
        queryset = POSTransaction.objects.filter(status="completed")

        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        if staff_id:
            queryset = queryset.filter(session__staff_id=staff_id)

        # Calculate stats
        stats = queryset.aggregate(
            total_sales=Sum("total_amount"),
            total_transactions=Count("id"),
            average_transaction=Avg("total_amount"),
        )

        # Comprehensive payment method breakdown with transaction counts
        # Note: Can't use Avg on same field being aggregated, calculate manually
        payment_breakdown = queryset.values("payment_method").annotate(
            total_amount=Sum("total_amount"), transaction_count=Count("id")
        )

        # Initialize payment method stats
        payment_methods = {
            "cash": {"amount": Decimal("0"), "count": 0, "average": Decimal("0")},
            "card": {"amount": Decimal("0"), "count": 0, "average": Decimal("0")},
            "mpesa": {"amount": Decimal("0"), "count": 0, "average": Decimal("0")},
            "airtel": {"amount": Decimal("0"), "count": 0, "average": Decimal("0")},
        }

        # Populate payment method stats from aggregated data
        for item in payment_breakdown:
            method = item["payment_method"]
            if method in payment_methods:
                amount = item["total_amount"] or Decimal("0")
                count = item["transaction_count"] or 0
                # Calculate average manually from sum and count
                average = (amount / count) if count > 0 else Decimal("0")

                payment_methods[method] = {
                    "amount": amount,
                    "count": count,
                    "average": average,
                }

        # Calculate combined mobile money stats
        mobile_money_amount = (
            payment_methods["mpesa"]["amount"] + payment_methods["airtel"]["amount"]
        )
        mobile_money_count = (
            payment_methods["mpesa"]["count"] + payment_methods["airtel"]["count"]
        )
        mobile_money_average = (
            mobile_money_amount / mobile_money_count
            if mobile_money_count > 0
            else Decimal("0")
        )

        # Legacy format for backward compatibility
        stats["cash_sales"] = payment_methods["cash"]["amount"]
        stats["card_sales"] = payment_methods["card"]["amount"]
        stats["mobile_money_sales"] = mobile_money_amount

        # Detailed payment method analytics
        total_amount = stats["total_sales"] or Decimal("0")
        stats["payment_methods"] = {
            "cash": {
                "amount": float(payment_methods["cash"]["amount"]),
                "count": payment_methods["cash"]["count"],
                "average": float(payment_methods["cash"]["average"]),
                "percentage": float(
                    (payment_methods["cash"]["amount"] / total_amount * 100)
                    if total_amount > 0
                    else 0
                ),
            },
            "card": {
                "amount": float(payment_methods["card"]["amount"]),
                "count": payment_methods["card"]["count"],
                "average": float(payment_methods["card"]["average"]),
                "percentage": float(
                    (payment_methods["card"]["amount"] / total_amount * 100)
                    if total_amount > 0
                    else 0
                ),
            },
            "mpesa": {
                "amount": float(payment_methods["mpesa"]["amount"]),
                "count": payment_methods["mpesa"]["count"],
                "average": float(payment_methods["mpesa"]["average"]),
                "percentage": float(
                    (payment_methods["mpesa"]["amount"] / total_amount * 100)
                    if total_amount > 0
                    else 0
                ),
            },
            "airtel": {
                "amount": float(payment_methods["airtel"]["amount"]),
                "count": payment_methods["airtel"]["count"],
                "average": float(payment_methods["airtel"]["average"]),
                "percentage": float(
                    (payment_methods["airtel"]["amount"] / total_amount * 100)
                    if total_amount > 0
                    else 0
                ),
            },
            "mobile_money": {
                "amount": float(mobile_money_amount),
                "count": mobile_money_count,
                "average": float(mobile_money_average),
                "percentage": float(
                    (mobile_money_amount / total_amount * 100)
                    if total_amount > 0
                    else 0
                ),
            },
        }

        # Top products
        top_products = (
            POSTransactionItem.objects.filter(transaction__in=queryset)
            .values("product__name", "product__sku")
            .annotate(total_quantity=Sum("quantity"), total_revenue=Sum("line_total"))
            .order_by("-total_revenue")[:10]
        )

        stats["top_products"] = list(top_products)

        # Hourly sales (last 24 hours, safe)
        now = timezone.now()
        hourly_start = now - timedelta(hours=24)
        hourly_sales = (
            queryset.filter(created_at__gte=hourly_start)
            .annotate(hour=ExtractHour("created_at"))
            .values("hour")
            .annotate(total=Sum("total_amount"), count=Count("id"))
            .order_by("hour")
        )
        stats["hourly_sales"] = list(hourly_sales)

        # Daily sales (last 30 days, safe)
        daily_start = now - timedelta(days=30)
        daily_sales = (
            queryset.filter(created_at__gte=daily_start)
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(total=Sum("total_amount"), count=Count("id"))
            .order_by("date")
        )
        stats["daily_sales"] = list(daily_sales)

        serializer = POSDashboardStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def sales_report(self, request):
        """Generate detailed sales report."""
        # Similar to stats but with more details
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        queryset = POSTransaction.objects.filter(status="completed")

        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)

        transactions = POSTransactionSerializer(queryset, many=True)

        return Response(
            {
                "transactions": transactions.data,
                "summary": {
                    "total_sales": queryset.aggregate(Sum("total_amount"))[
                        "total_amount__sum"
                    ],
                    "total_count": queryset.count(),
                },
            }
        )
