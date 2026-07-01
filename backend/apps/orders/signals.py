import logging

from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone

from apps.core.license import LicenseVerifier

from .models import Order
from .tasks import create_order_notifications

NOTIFY_STATUSES = {"processing", "completed"}
logger = logging.getLogger(__name__)


@receiver(pre_save, sender=Order)
def capture_previous_order_status(sender, instance, **kwargs):
    logger.debug("[SIGNAL] pre_save order_id=%s status=%s", instance.pk, instance.status)
    if not instance.pk:
        logger.debug("[SIGNAL] pre_save skipped: new order has no previous status")
        return
    instance._previous_status = (
        Order.objects.filter(pk=instance.pk).values_list("status", flat=True).first()
    )
    logger.debug(
        "[SIGNAL] captured previous status order_id=%s previous_status=%s",
        instance.pk,
        instance._previous_status,
    )


@receiver(post_save, sender=Order)
def notify_staff_on_order_status(sender, instance, created, **kwargs):
    feature_notifications_enabled = getattr(settings, "FEATURE_NOTIFICATIONS", False)
    logger.debug(
        "[SIGNAL] post_save order_id=%s created=%s status=%s feature_notifications=%s",
        instance.pk,
        created,
        instance.status,
        feature_notifications_enabled,
    )
    if not feature_notifications_enabled:
        logger.debug("[SIGNAL] notifications disabled by FEATURE_NOTIFICATIONS flag")
        return

    if instance.status not in NOTIFY_STATUSES:
        logger.debug(
            "[SIGNAL] status %s not in notify statuses %s",
            instance.status,
            sorted(NOTIFY_STATUSES),
        )
        return

    previous_status = None if created else getattr(instance, "_previous_status", None)
    logger.debug(
        "[SIGNAL] status transition order_id=%s %s -> %s",
        instance.pk,
        previous_status,
        instance.status,
    )
    if not created and previous_status == instance.status:
        logger.debug("[SIGNAL] skipping duplicate status notification")
        return

    license_info = LicenseVerifier.get_license_info()
    features = license_info.get("features", {})
    is_demo_mode = license_info.get("license_type") == LicenseVerifier.LICENSE_DEMO
    max_orders_per_day = features.get("max_orders_per_day", -1)

    if is_demo_mode and max_orders_per_day != -1:
        today_orders = Order.objects.filter(created_at__date=timezone.now().date()).count()
        logger.debug(
            "[SIGNAL] demo mode order cap check: today_orders=%s max_orders_per_day=%s",
            today_orders,
            max_orders_per_day,
        )
        if today_orders > max_orders_per_day:
            logger.warning("[SIGNAL] demo mode order cap reached; skipping notification")
            return

    logger.info(
        "[SIGNAL] creating notifications synchronously for order_id=%s status=%s",
        instance.id,
        instance.status,
    )
    create_order_notifications(instance.id, instance.status)
