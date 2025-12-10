# Generated migration for OTP delivery tracking

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0006_add_otp_security_fields"),
    ]

    operations = [
        migrations.CreateModel(
            name="OTPDeliveryLog",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "identifier",
                    models.CharField(max_length=255, help_text="Phone number or email"),
                ),
                (
                    "delivery_method",
                    models.CharField(
                        max_length=20,
                        choices=[
                            ("whatsapp", "WhatsApp"),
                            ("sms", "SMS"),
                            ("email", "Email"),
                            ("console", "Console"),
                            ("failed", "Failed"),
                        ],
                        help_text="Method used to deliver OTP",
                    ),
                ),
                ("success", models.BooleanField(default=False)),
                ("ip_address", models.GenericIPAddressField(null=True, blank=True)),
                (
                    "error_message",
                    models.TextField(
                        blank=True, help_text="Error details if delivery failed"
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="otp_deliveries",
                        to=settings.AUTH_USER_MODEL,
                        null=True,
                        blank=True,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(
                        fields=["-created_at"], name="accounts_ot_created_idx"
                    ),
                    models.Index(
                        fields=["delivery_method"], name="accounts_ot_deliver_idx"
                    ),
                    models.Index(fields=["success"], name="accounts_ot_success_idx"),
                ],
            },
        ),
    ]
