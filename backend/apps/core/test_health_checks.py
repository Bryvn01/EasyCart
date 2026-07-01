from unittest.mock import patch

from django.test import TestCase
from django.urls import reverse

from utils.health_checks import HealthStatus


class HealthEndpointBehaviorTests(TestCase):
    def test_health_returns_200_when_db_is_degraded_but_available(self):
        with (
            patch(
                "utils.health_checks.HealthCheckView._check_database",
                return_value={
                    "status": HealthStatus.DEGRADED,
                    "response_time_ms": 3500.0,
                    "message": "Database response very slow (3500.0ms, likely waking from sleep)",
                },
            ),
            patch(
                "utils.health_checks.HealthCheckView._check_cache",
                return_value={"status": HealthStatus.HEALTHY, "message": "ok"},
            ),
            patch(
                "utils.health_checks.HealthCheckView._check_disk_space",
                return_value={"status": HealthStatus.HEALTHY, "message": "ok"},
            ),
        ):
            response = self.client.get(reverse("health-check-enhanced"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], HealthStatus.DEGRADED)
        self.assertEqual(response.data["checks"]["database"]["status"], HealthStatus.DEGRADED)

    def test_health_returns_503_when_db_is_unhealthy(self):
        with (
            patch(
                "utils.health_checks.HealthCheckView._check_database",
                return_value={
                    "status": HealthStatus.UNHEALTHY,
                    "message": "Database unavailable: OperationalError",
                },
            ),
            patch(
                "utils.health_checks.HealthCheckView._check_cache",
                return_value={"status": HealthStatus.HEALTHY, "message": "ok"},
            ),
            patch(
                "utils.health_checks.HealthCheckView._check_disk_space",
                return_value={"status": HealthStatus.HEALTHY, "message": "ok"},
            ),
        ):
            response = self.client.get(reverse("health-check-enhanced"))

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["status"], HealthStatus.UNHEALTHY)
        self.assertEqual(
            response.data["checks"]["database"]["status"], HealthStatus.UNHEALTHY
        )

    def test_liveness_endpoint_always_returns_200(self):
        response = self.client.get(reverse("liveness-check"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "alive")
