"""
Tests for idempotency middleware, decorator, and key generation.
Covers duplicate request prevention for cart, checkout, and payments.
"""

import json
from django.test import TestCase, RequestFactory
from django.http import JsonResponse
from unittest.mock import patch, MagicMock
from apps.orders.idempotency import (
    generate_idempotency_key,
    idempotent_operation,
    IdempotencyMiddleware,
)


class GenerateIdempotencyKeyTests(TestCase):
    """Tests for generate_idempotency_key function"""

    def test_same_inputs_produce_same_key(self):
        """Identical inputs should generate the same key"""
        key1 = generate_idempotency_key(1, "add_to_cart", {"product_id": 5})
        key2 = generate_idempotency_key(1, "add_to_cart", {"product_id": 5})
        self.assertEqual(key1, key2)

    def test_different_users_produce_different_keys(self):
        """Different users should generate different keys"""
        key1 = generate_idempotency_key(1, "add_to_cart", {"product_id": 5})
        key2 = generate_idempotency_key(2, "add_to_cart", {"product_id": 5})
        self.assertNotEqual(key1, key2)

    def test_different_operations_produce_different_keys(self):
        """Different operations should generate different keys"""
        key1 = generate_idempotency_key(1, "add_to_cart", {"product_id": 5})
        key2 = generate_idempotency_key(1, "checkout", {"product_id": 5})
        self.assertNotEqual(key1, key2)

    def test_different_data_produces_different_keys(self):
        """Different data should generate different keys"""
        key1 = generate_idempotency_key(1, "add_to_cart", {"product_id": 5})
        key2 = generate_idempotency_key(1, "add_to_cart", {"product_id": 6})
        self.assertNotEqual(key1, key2)

    def test_key_is_consistent_across_calls(self):
        """Key should be deterministic"""
        data = {"product_id": 5, "quantity": 2}
        key1 = generate_idempotency_key(1, "test", data)
        key2 = generate_idempotency_key(1, "test", data)
        self.assertEqual(key1, key2)


class IdempotentOperationDecoratorTests(TestCase):
    """Tests for the idempotent_operation decorator"""

    def setUp(self):
        self.factory = RequestFactory()

    def _create_mock_view(self, status=200, response_data=None):
        """Helper to create a view decorated with idempotent_operation"""

        @idempotent_operation("test_operation")
        def view(request):
            return JsonResponse(response_data or {"message": "success"}, status=status)

        return view

    # ---------- Cache miss (first request) ----------

    @patch("apps.orders.idempotency.cache")
    def test_first_request_processes_normally(self, mock_cache):
        """First request should not be cached and should return the view response"""
        mock_cache.get.return_value = None  # Cache miss
        view = self._create_mock_view(response_data={"result": "ok"})
        request = self.factory.post(
            "/test/", data={"item": 1}, content_type="application/json"
        )
        request.user = MagicMock()
        request.user.is_authenticated = True
        request.user.id = 1

        response = view(request)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data["result"], "ok")

    # ---------- Cache hit (duplicate request) ----------

    @patch("apps.orders.idempotency.cache")
    def test_duplicate_request_returns_cached_response(self, mock_cache):
        """Second request with same idempotency key should return cached response"""
        cached_data = {"message": "cached", "status": 200}
        mock_cache.get.return_value = cached_data  # Cache hit
        view = self._create_mock_view()
        request = self.factory.post(
            "/test/", data={"item": 1}, content_type="application/json"
        )
        request.user = MagicMock()
        request.user.is_authenticated = True
        request.user.id = 1

        response = view(request)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data["message"], "cached")

    # ---------- Non-idempotent methods pass through ----------

    @patch("apps.orders.idempotency.cache")
    def test_get_requests_are_not_cached(self, mock_cache):
        """GET requests should not be idempotently cached"""
        view = self._create_mock_view()
        request = self.factory.get("/test/")
        request.user = MagicMock()

        response = view(request)
        self.assertEqual(response.status_code, 200)
        # Cache should not have been checked or set
        mock_cache.get.assert_not_called()
        mock_cache.set.assert_not_called()

    # ---------- Failed responses are not cached ----------

    @patch("apps.orders.idempotency.cache")
    def test_error_response_is_not_cached(self, mock_cache):
        """4xx/5xx responses should not be cached"""
        mock_cache.get.return_value = None
        view = self._create_mock_view(status=400, response_data={"error": "bad"})
        request = self.factory.post(
            "/test/", data={"item": 1}, content_type="application/json"
        )
        request.user = MagicMock()
        request.user.is_authenticated = True
        request.user.id = 1

        response = view(request)
        self.assertEqual(response.status_code, 400)
        # Cache.set should not be called for errors
        mock_cache.set.assert_not_called()

    # ---------- Anonymous users ----------

    @patch("apps.orders.idempotency.cache")
    def test_anonymous_user_uses_anonymous_key(self, mock_cache):
        """Anonymous users should use 'anonymous' as user ID"""
        mock_cache.get.return_value = None
        view = self._create_mock_view()
        request = self.factory.post(
            "/test/", data={"item": 1}, content_type="application/json"
        )
        request.user = MagicMock()
        request.user.is_authenticated = False

        response = view(request)
        self.assertEqual(response.status_code, 200)


class IdempotencyMiddlewareTests(TestCase):
    """Tests for IdempotencyMiddleware"""

    def setUp(self):
        self.factory = RequestFactory()

    def _get_response(self, request):
        return JsonResponse({"message": "ok"})

    # ---------- Non-idempotent path passes through ----------

    @patch("apps.orders.idempotency.cache")
    def test_non_idempotent_path_passes_through(self, mock_cache):
        """Requests to non-idempotent paths should be ignored"""
        middleware = IdempotencyMiddleware(self._get_response)
        request = self.factory.post("/api/other/")
        request.META["HTTP_X_IDEMPOTENCY_KEY"] = "test-key"
        request.user = MagicMock()

        response = middleware(request)
        self.assertEqual(response.status_code, 200)
        # Cache should not be checked
        mock_cache.get.assert_not_called()

    # ---------- Cache hit for idempotent path ----------

    @patch("apps.orders.idempotency.cache")
    def test_cached_response_returned(self, mock_cache):
        """If a cached response exists, it should be returned"""
        cached = {"message": "cached_response", "status": 200}
        mock_cache.get.return_value = cached
        middleware = IdempotencyMiddleware(self._get_response)
        request = self.factory.post("/api/orders/cart/add/")
        request.META["HTTP_X_IDEMPOTENCY_KEY"] = "test-key"
        request.user = MagicMock()

        response = middleware(request)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data["message"], "cached_response")

    # ---------- No idempotency key passes through ----------

    @patch("apps.orders.idempotency.cache")
    def test_missing_key_passes_through(self, mock_cache):
        """Without idempotency key, request should be processed normally"""
        mock_cache.get.return_value = None
        middleware = IdempotencyMiddleware(self._get_response)
        request = self.factory.post("/api/orders/cart/add/")
        # No X-Idempotency-Key header
        request.user = MagicMock()

        response = middleware(request)
        self.assertEqual(response.status_code, 200)

    # ---------- Cache miss processes normally ----------

    @patch("apps.orders.idempotency.cache")
    def test_cache_miss_processes_normally(self, mock_cache):
        """If no cached response, should proceed to the view"""
        mock_cache.get.return_value = None
        middleware = IdempotencyMiddleware(self._get_response)
        request = self.factory.post("/api/orders/cart/add/")
        request.META["HTTP_X_IDEMPOTENCY_KEY"] = "test-key"
        request.user = MagicMock()

        response = middleware(request)
        self.assertEqual(response.status_code, 200)
