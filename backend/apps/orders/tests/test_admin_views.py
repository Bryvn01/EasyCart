"""
Tests for AdminOrderViewSet.
Covers authentication, filtering, retrieve, status update, and error handling.
"""

from django.test import TestCase, RequestFactory
from rest_framework.test import force_authenticate
from unittest.mock import patch
from apps.orders.admin_views import AdminOrderViewSet
from apps.orders.models import Order
from apps.accounts.models import User


class AdminOrderViewSetTests(TestCase):
    """Tests for AdminOrderViewSet"""

    def setUp(self):
        self.factory = RequestFactory()
        self.view = AdminOrderViewSet.as_view(
            actions={
                "get": "list",
                "post": "create",
                "patch": "partial_update",
            }
        )

        # Create users
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="AdminPass123!",
            is_admin=True,
        )
        self.regular_user = User.objects.create_user(
            username="user", email="user@example.com", password="UserPass123!"
        )

        # Create test orders
        self.order1 = Order.objects.create(
            user=self.admin,
            total_amount=100,
            shipping_address="123 Test St",
            status="pending",
        )
        self.order2 = Order.objects.create(
            user=self.regular_user,
            total_amount=200,
            shipping_address="456 Test Ave",
            status="processing",
        )

    # ---------- Authentication ----------

    def test_unauthenticated_access_denied(self):
        """Unauthenticated request should return 401"""
        request = self.factory.get("/api/admin/orders/")
        response = self.view(request)
        self.assertEqual(response.status_code, 401)

    def test_regular_user_gets_empty_queryset(self):
        """Non-admin user should get empty list"""
        request = self.factory.get("/api/admin/orders/")
        force_authenticate(request, user=self.regular_user)
        response = self.view(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)  # Empty list

    def test_admin_can_list_orders(self):
        """Admin user should see all orders"""
        request = self.factory.get("/api/admin/orders/")
        force_authenticate(request, user=self.admin)
        response = self.view(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)  # Both orders visible

    # ---------- Filtering ----------

    def test_filter_by_status(self):
        """Should filter orders by status"""
        request = self.factory.get("/api/admin/orders/?status=pending")
        force_authenticate(request, user=self.admin)
        response = self.view(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)  # Only order1 is pending
        self.assertEqual(response.data[0]["status"], "pending")

    def test_filter_by_payment_status(self):
        """Should filter by payment status"""
        self.order1.payment_status = "completed"
        self.order1.save()
        self.order2.payment_status = "pending"
        self.order2.save()

        request = self.factory.get("/api/admin/orders/?payment_status=completed")
        force_authenticate(request, user=self.admin)
        response = self.view(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_search_by_user_email(self):
        """Should search orders by user email"""
        request = self.factory.get("/api/admin/orders/?search=user@example.com")
        force_authenticate(request, user=self.admin)
        response = self.view(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)  # Only order2 belongs to regular user
        self.assertEqual(response.data[0]["user"], self.regular_user.id)

    def test_search_by_order_id(self):
        """Should search orders by order ID"""
        request = self.factory.get(f"/api/admin/orders/?search={self.order1.id}")
        force_authenticate(request, user=self.admin)
        response = self.view(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    # ---------- Retrieve ----------

    def test_retrieve_order_success(self):
        """Admin should be able to retrieve a single order"""
        view = AdminOrderViewSet.as_view(actions={"get": "retrieve"})
        request = self.factory.get(f"/api/admin/orders/{self.order1.id}/")
        force_authenticate(request, user=self.admin)
        response = view(request, pk=self.order1.id)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.order1.id)

    def test_retrieve_nonexistent_order(self):
        """Should return 404 for nonexistent order"""
        view = AdminOrderViewSet.as_view(actions={"get": "retrieve"})
        request = self.factory.get("/api/admin/orders/99999/")
        force_authenticate(request, user=self.admin)
        response = view(request, pk=99999)
        self.assertEqual(response.status_code, 404)

    # ---------- Partial Update (Status Change) ----------

    def test_update_order_status(self):
        """Admin should be able to update order status"""
        view = AdminOrderViewSet.as_view(actions={"patch": "partial_update"})
        request = self.factory.patch(
            f"/api/admin/orders/{self.order1.id}/",
            {"status": "shipped"},
            content_type="application/json",
        )
        force_authenticate(request, user=self.admin)
        response = view(request, pk=self.order1.id)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "shipped")

        # Verify database updated
        self.order1.refresh_from_db()
        self.assertEqual(self.order1.status, "shipped")

    def test_update_order_without_status(self):
        """Update without status field should succeed without changing status"""
        view = AdminOrderViewSet.as_view(actions={"patch": "partial_update"})
        original_status = self.order1.status
        request = self.factory.patch(
            f"/api/admin/orders/{self.order1.id}/",
            {"shipping_address": "New Address"},
            content_type="application/json",
        )
        force_authenticate(request, user=self.admin)
        response = view(request, pk=self.order1.id)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], original_status)  # Unchanged

    # ---------- Error Handling (mocked) ----------

    @patch("apps.orders.admin_views.AdminOrderViewSet.get_queryset")
    def test_list_handles_exception(self, mock_queryset):
        """List should return 500 on unexpected error"""
        mock_queryset.side_effect = Exception("Database error")
        request = self.factory.get("/api/admin/orders/")
        force_authenticate(request, user=self.admin)
        response = self.view(request)
        self.assertEqual(response.status_code, 500)
        self.assertIn("error", response.data)

    @patch("apps.orders.admin_views.AdminOrderViewSet.get_object")
    def test_retrieve_handles_exception(self, mock_get_object):
        """Retrieve should return 404 on error"""
        mock_get_object.side_effect = Exception("Not found")
        view = AdminOrderViewSet.as_view(actions={"get": "retrieve"})
        request = self.factory.get("/api/admin/orders/1/")
        force_authenticate(request, user=self.admin)
        response = view(request, pk=1)
        self.assertEqual(response.status_code, 404)

    @patch("apps.orders.admin_views.AdminOrderViewSet.get_object")
    def test_partial_update_handles_exception(self, mock_get_object):
        """Partial update should return 400 on error"""
        mock_get_object.side_effect = Exception("Update failed")
        view = AdminOrderViewSet.as_view(actions={"patch": "partial_update"})
        request = self.factory.patch(
            "/api/admin/orders/1/",
            {"status": "shipped"},
            content_type="application/json",
        )
        force_authenticate(request, user=self.admin)
        response = view(request, pk=1)
        self.assertEqual(response.status_code, 400)
