from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.orders.models import Order
from .models import Payment
import os

User = get_user_model()


class PaymentAPITestCase(APITestCase):
    def setUp(self):
        test_password = os.environ.get('TEST_PASSWORD', 'TestP@ssw0rd!2024')
        self.user = User.objects.create_user(username="testuser", password=test_password)
        self.order = Order.objects.create(
            user=self.user,
            total_amount=100,
            shipping_address="123 Test St",
            phone_number="0700000000",
            payment_method="stripe",
            payment_status="pending",
        )
        self.client.force_authenticate(user=self.user)

    def test_create_payment(self):
        url = reverse("payment-list")
        data = {
            "order": self.order.id,
            "method": "stripe",
            "amount": "100.00",
            "currency": "KES",
        }
        response = self.client.post(url, data)
        print("RESPONSE DATA:", response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Payment.objects.count(), 1)
        payment = Payment.objects.first()
        self.assertEqual(payment.user, self.user)
        self.assertEqual(payment.method, "stripe")
        self.assertEqual(payment.amount, 100.00)
        self.assertEqual(payment.status, "pending")

    def test_list_payments(self):
        Payment.objects.create(user=self.user, order=self.order, method="mpesa", amount=50, currency="KES")
        url = reverse("payment-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # DRF pagination returns a dict with 'results' key
        self.assertEqual(len(response.data["results"]), 1)
