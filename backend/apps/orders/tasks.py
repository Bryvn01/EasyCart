import logging

from celery import shared_task
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.mail import send_mail

from apps.core.license import LicenseVerifier

from .models import Order, OrderNotification

logger = logging.getLogger(__name__)
User = get_user_model()


def _get_license_features():
    license_info = LicenseVerifier.get_license_info()
    return license_info.get("license_type"), license_info.get("features", {})


@shared_task(max_retries=3, default_retry_delay=60, rate_limit="10/m")
def create_order_notifications(order_id, order_status):
    if not getattr(settings, "FEATURE_NOTIFICATIONS", False):
        return

    try:
        order = Order.objects.select_related("user").get(id=order_id)
    except Order.DoesNotExist:
        return

    license_type, features = _get_license_features()
    max_orders_per_day = features.get("max_orders_per_day", -1)
    if license_type == LicenseVerifier.LICENSE_DEMO and max_orders_per_day != -1:
        today_orders = Order.objects.filter(created_at__date=order.created_at.date()).count()
        if today_orders > max_orders_per_day:
            return

    cache_key = "staff_recipients_order_notifications"
    recipient_ids = cache.get(cache_key)
    if recipient_ids is None:
        recipient_ids = list(
            User.objects.filter(is_staff=True, is_active=True).values_list("id", flat=True)
        )
        cache.set(cache_key, recipient_ids, 300)
    else:
        recipient_ids = list(
            User.objects.filter(
                id__in=recipient_ids,
                is_staff=True,
                is_active=True,
            ).values_list("id", flat=True)
        )
        cache.set(cache_key, recipient_ids, 300)

    if not recipient_ids:
        return

    customer_email = getattr(order.user, "email", "") if order.user_id else ""
    safe_email = customer_email or "customer"
    message = f"Order #{order.id} moved to {order_status} ({safe_email})"

    notifications = [
        OrderNotification(
            order=order,
            recipient_id=user_id,
            order_status=order_status,
            message=message,
        )
        for user_id in recipient_ids
    ]
    OrderNotification.objects.bulk_create(notifications, ignore_conflicts=True)

    if features.get("email_support", False):
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            send_order_notification_emails(order.id, recipient_ids, order_status)
        else:
            send_order_notification_emails.delay(order.id, recipient_ids, order_status)


@shared_task(max_retries=2, default_retry_delay=60, rate_limit="10/m")
def send_order_notification_emails(order_id, recipient_ids, order_status):
    try:
        order = Order.objects.select_related("user").get(id=order_id)
    except Order.DoesNotExist:
        return

    staff_emails = list(
        User.objects.filter(id__in=recipient_ids, is_active=True)
        .exclude(email="")
        .values_list("email", flat=True)
    )
    if not staff_emails:
        return

    subject = f"Order #{order.id} status: {order_status}"
    body = (
        f"Order #{order.id} is now {order_status}.\n"
        f"Customer: {getattr(order.user, 'email', 'N/A')}\n"
        f"Total: {order.total_amount}"
    )
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=staff_emails,
            fail_silently=False,
        )
    except Exception as exc:
        logger.warning(
            "Order notification email failed for order_id=%s: %s", order_id, exc
        )
