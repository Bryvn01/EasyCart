from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone

from apps.core.license import LicenseVerifier

from .models import Order
from .tasks import create_order_notifications

NOTIFY_STATUSES = {"processing", "completed"}


@receiver(pre_save, sender=Order)
def capture_previous_order_status(sender, instance, **kwargs):
    if not instance.pk:
        return
    instance._previous_status = (
        Order.objects.filter(pk=instance.pk).values_list("status", flat=True).first()
    )


@receiver(post_save, sender=Order)
def notify_staff_on_order_status(sender, instance, created, **kwargs):
    if not getattr(settings, "FEATURE_NOTIFICATIONS", False):
        return

    if instance.status not in NOTIFY_STATUSES:
        return

    previous_status = None if created else getattr(instance, "_previous_status", None)
    if not created and previous_status == instance.status:
        return

    license_info = LicenseVerifier.get_license_info()
    features = license_info.get("features", {})
    is_demo_mode = license_info.get("license_type") == LicenseVerifier.LICENSE_DEMO
    max_orders_per_day = features.get("max_orders_per_day", -1)

    if is_demo_mode and max_orders_per_day != -1:
        today_orders = Order.objects.filter(created_at__date=timezone.now().date()).count()
        if today_orders > max_orders_per_day:
            return

    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        create_order_notifications(instance.id, instance.status)
    else:
        create_order_notifications.delay(instance.id, instance.status)
