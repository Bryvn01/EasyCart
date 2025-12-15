from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Payment, PaymentLog
from .serializers import PaymentSerializer
from apps.orders.models import Order
from .gateways.mpesa_gateway import MPesaGateway
from apps.throttling import PaymentRateThrottle
import re


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [PaymentRateThrottle]  # Limit to 10 payment attempts per minute

    def get_queryset(self):
        # Only allow users to see their own payments (admin can override in future)
        return Payment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["post"], url_path="initiate_mpesa")
    def initiate_mpesa(self, request):
        order_id = request.data.get("order_id")
        phone_number = request.data.get("phone_number")
        # Validate phone number
        if not phone_number or not re.match(r"^254[0-9]{9}$", phone_number):
            return Response(
                {
                    "error": "Invalid phone number. Must start with 254 and be 12 digits."
                },
                status=400,
            )
        # Validate order
        order = get_object_or_404(Order, id=order_id, user=request.user)
        # Create payment record
        payment = Payment.objects.create(
            user=request.user,
            order=order,
            method="mpesa",
            amount=order.total_amount,
            currency="KES",
            status="pending",
        )
        try:
            # Initialize M-Pesa gateway (now uses instance method for environment awareness)
            gateway = MPesaGateway()
            stk_response = gateway.initiate_stk_push(payment, phone_number)
            payment.transaction_id = stk_response.get("CheckoutRequestID")
            payment.save()
            return Response(
                {
                    "message": "STK Push sent to your phone",
                    "payment_id": payment.id,
                    "checkout_request_id": payment.transaction_id,
                },
                status=200,
            )
        except Exception as e:
            PaymentLog.objects.create(
                payment=payment, event="mpesa_stk_push_error", message=str(e)
            )
            payment.status = "failed"
            payment.save()
            return Response(
                {"error": "Failed to initiate M-Pesa payment", "details": str(e)},
                status=500,
            )


# Webhook for M-Pesa callback
@method_decorator(csrf_exempt, name="dispatch")
class MPesaCallbackView(View):
    def post(self, request, *args, **kwargs):
        import json

        try:
            data = json.loads(request.body.decode("utf-8"))
            ok = MPesaGateway.handle_callback(data)
            if ok:
                return JsonResponse({"result": "Callback processed"}, status=200)
            else:
                return JsonResponse({"result": "Callback failed"}, status=400)
        except Exception as e:
            PaymentLog.objects.create(
                payment=None, event="mpesa_callback_exception", message=str(e)
            )
            return JsonResponse({"error": str(e)}, status=500)
