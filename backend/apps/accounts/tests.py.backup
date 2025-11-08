from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.conf import settings
import os
from .models import User


class CustomerAPITests(APITestCase):
    def setUp(self):
        # Use environment variable or generate secure test password
        test_password = os.environ.get("TEST_PASSWORD", "TestP@ssw0rd!2024")

        self.superadmin = User.objects.create_user(
            username="superadmin",
            email="superadmin@example.com",
            password=test_password,
            role="superadmin",
            is_superuser=True,
            is_admin=True,
        )
        self.manager = User.objects.create_user(
            username="manager",
            email="manager@example.com",
            password=test_password,
            role="manager",
            is_admin=True,
        )
        self.customer = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password=test_password,
            role="viewer",
        )
        self.client = APIClient()

    def test_admin_can_list_customers(self):
        self.client.force_authenticate(user=self.superadmin)
        url = reverse("customer-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 3)

    def test_non_admin_cannot_list_customers(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse("customer-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_retrieve_any_customer(self):
        self.client.force_authenticate(user=self.manager)
        url = reverse("customer-detail", args=[self.customer.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.customer.email)

    def test_customer_can_retrieve_self(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse("customer-detail", args=[self.customer.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.customer.email)

    def test_customer_cannot_retrieve_others(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse("customer-detail", args=[self.manager.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_customer_can_update_self(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse("customer-detail", args=[self.customer.pk])
        response = self.client.patch(url, {"phone": "1234567890"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.phone, "1234567890")

    def test_admin_can_update_any_customer(self):
        self.client.force_authenticate(user=self.superadmin)
        url = reverse("customer-detail", args=[self.customer.pk])
        response = self.client.patch(url, {"phone": "9999999999"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.phone, "9999999999")

    def test_customer_cannot_delete_others(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse("customer-detail", args=[self.manager.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_customer(self):
        self.client.force_authenticate(user=self.superadmin)
        url = reverse("customer-detail", args=[self.customer.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(pk=self.customer.pk).exists())
