"""
Health Check and Monitoring Utilities
Provides endpoints and utilities for system health monitoring and observability.
"""

import logging
import time
from typing import Dict, Any
from django.db import connection
from django.core.cache import cache
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

logger = logging.getLogger(__name__)


_LAST_CACHE_HEALTH_LOG_TS = 0.0


def _throttled_log(level: int, msg: str, cooldown_seconds: int = 60) -> None:
    """Log at most once per cooldown window per process."""
    global _LAST_CACHE_HEALTH_LOG_TS
    now = time.time()
    if now - _LAST_CACHE_HEALTH_LOG_TS < cooldown_seconds:
        return
    _LAST_CACHE_HEALTH_LOG_TS = now
    logger.log(level, msg)


class HealthStatus:
    """Health check status constants."""

    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"


class HealthCheckView(APIView):
    """
    Comprehensive health check endpoint.
    Returns system health status including database, cache, and external services.

    Endpoint: GET /api/health/
    Authentication: Public (no authentication required)
    """

    permission_classes = [AllowAny]

    def get(self, request):
        """
        Perform health checks and return overall system status.

        Returns:
            200: All systems healthy
            503: One or more systems degraded/unhealthy
        """
        start_time = time.perf_counter()

        checks = {
            "database": self._check_database(),
            "cache": self._check_cache(),
            "disk": self._check_disk_space(),
        }

        # Add optional external service checks
        if hasattr(settings, "MPESA_CONSUMER_KEY") and settings.MPESA_CONSUMER_KEY:
            checks["mpesa"] = self._check_mpesa()

        # Determine overall status
        overall_status = HealthStatus.HEALTHY

        for check_name, check_result in checks.items():
            if check_result["status"] == HealthStatus.UNHEALTHY:
                overall_status = HealthStatus.UNHEALTHY
                break
            elif check_result["status"] == HealthStatus.DEGRADED:
                overall_status = HealthStatus.DEGRADED

        response_time = time.perf_counter() - start_time

        response_data = {
            "status": overall_status,
            # Intentionally dynamic for observability; payload size may vary slightly.
            "timestamp": time.time(),
            "response_time_ms": round(response_time * 1000, 2),
            "checks": checks,
            "version": getattr(settings, "APP_VERSION", "1.0.0"),
        }

        # Return 503 only when unhealthy for load balancer detection.
        http_status = (
            status.HTTP_503_SERVICE_UNAVAILABLE
            if overall_status == HealthStatus.UNHEALTHY
            else status.HTTP_200_OK
        )

        return Response(response_data, status=http_status)

    def _check_database(self) -> Dict[str, Any]:
        """Check database connectivity and responsiveness with retry for sleeping databases."""
        # Increased retries for Railway free tier (database sleeps after 15min)
        max_retries = getattr(settings, "HEALTHCHECK_DB_RETRIES", 5)
        initial_retry_delay = 2  # Start with 2 seconds
        max_retry_delay = 10  # Cap at 10 seconds
        retry_delay = initial_retry_delay

        for attempt in range(max_retries + 1):
            try:
                start_time = time.perf_counter()

                # Close stale connection if retrying
                if attempt > 0:
                    connection.close()
                    time.sleep(retry_delay)

                # Execute simple query
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    cursor.fetchone()

                response_time = time.perf_counter() - start_time
                response_time_ms = round(response_time * 1000, 2)

                # Adjust thresholds for Railway free tier (sleeping database can take longer)
                degraded_ms = int(getattr(settings, "HEALTHCHECK_DB_DEGRADED_MS", 1000))
                unhealthy_ms = int(
                    getattr(settings, "HEALTHCHECK_DB_UNHEALTHY_MS", 5000)
                )

                # A successful query should not mark the service unhealthy solely due to latency.
                # Reserve UNHEALTHY for true connectivity/query failures handled in the except path.
                if response_time_ms >= unhealthy_ms:
                    check_status = HealthStatus.DEGRADED
                    message = (
                        f"Database response very slow ({response_time_ms}ms, likely waking from sleep)"
                    )
                elif response_time_ms >= degraded_ms:
                    check_status = HealthStatus.DEGRADED
                    message = f"Database response degraded ({response_time_ms}ms, waking from sleep)"
                else:
                    check_status = HealthStatus.HEALTHY
                    message = "Database connection healthy"

                return {
                    "status": check_status,
                    "response_time_ms": response_time_ms,
                    "message": message,
                    "retries": attempt,
                    "thresholds_ms": {
                        "degraded": degraded_ms,
                        "unhealthy": unhealthy_ms,
                    },
                }
            except Exception as e:
                if attempt < max_retries:
                    logger.warning(
                        f"Database health check attempt {attempt + 1}/{max_retries} "
                        f"failed, retrying in {retry_delay}s: {e}"
                    )
                    # Exponential backoff with cap
                    retry_delay = min(retry_delay * 1.5, max_retry_delay)
                    continue
                else:
                    error_details = str(e)
                    total_wait = sum(
                        [initial_retry_delay * (1.5**i) for i in range(max_retries)]
                    )
                    logger.error(
                        f"Database health check failed after {max_retries + 1} attempts "
                        f"(total {total_wait}s): {error_details}"
                    )
                    # Provide actionable error message
                    if "server closed the connection" in error_details.lower():
                        message = (
                            "Database waking up from sleep (Railway free tier). "
                            "This typically takes 30-60s. Please refresh in a moment."
                        )
                    elif "connection refused" in error_details.lower():
                        message = (
                            "Database connection refused. "
                            "Check DATABASE_URL and firewall settings."
                        )
                    elif "timeout" in error_details.lower():
                        message = (
                            "Database connection timeout. "
                            "The database may be under heavy load or unreachable."
                        )
                    else:
                        message = f"Database unavailable: {type(e).__name__}"

                    return {
                        "status": HealthStatus.UNHEALTHY,
                        "message": message,
                        "error_type": type(e).__name__,
                        "error_details": error_details[:200],
                        "retries": attempt + 1,
                        "help": (
                            "If using Railway free tier, database sleeps after "
                            "15min inactivity and takes ~30-60s to wake."
                        ),
                    }

    def _check_cache(self) -> Dict[str, Any]:
        """Check Redis cache connectivity."""
        if not getattr(settings, "HEALTHCHECK_CACHE_ENABLED", True):
            return {
                "status": HealthStatus.HEALTHY,
                "message": "Cache health check disabled",
            }

        try:
            start_time = time.perf_counter()

            # Test cache write and read
            test_key = f"_health_check_test_{int(time.time())}"
            test_value = "ok"

            retrieved = None
            used_pipeline = False

            # Prefer a single round-trip when using django-redis.
            client = getattr(cache, "client", None)
            if client is not None and hasattr(client, "get_client"):
                redis_client = client.get_client(write=True)
                pipe = redis_client.pipeline()
                pipe.set(test_key, test_value, ex=10)
                pipe.get(test_key)
                pipe.delete(test_key)
                results = pipe.execute()
                retrieved = results[1]
                used_pipeline = True
            else:
                cache.set(test_key, test_value, timeout=10)
                retrieved = cache.get(test_key)
                cache.delete(test_key)

            if retrieved not in (test_value, b"ok"):
                raise ValueError("Cache value mismatch")

            response_time = time.perf_counter() - start_time
            response_time_ms = round(response_time * 1000, 2)

            degraded_ms = int(getattr(settings, "HEALTHCHECK_CACHE_DEGRADED_MS", 250))
            unhealthy_ms = int(
                getattr(settings, "HEALTHCHECK_CACHE_UNHEALTHY_MS", 10000)
            )

            # Cache slowness is reported as degraded by default (cache is often non-critical).
            if response_time_ms >= unhealthy_ms:
                check_status = HealthStatus.DEGRADED
                message = f"Cache response very slow ({response_time_ms}ms)"
            elif response_time_ms >= degraded_ms:
                check_status = HealthStatus.DEGRADED
                message = f"Cache response degraded ({response_time_ms}ms)"
            else:
                check_status = HealthStatus.HEALTHY
                message = "Cache connection healthy"

            return {
                "status": check_status,
                "response_time_ms": response_time_ms,
                "message": message,
                "details": {
                    "used_pipeline": used_pipeline,
                },
                "thresholds_ms": {
                    "degraded": degraded_ms,
                    "unhealthy": unhealthy_ms,
                },
            }
        except Exception as e:
            # Cache is often non-critical; treat failures as degraded and avoid log spam.
            _throttled_log(
                logging.WARNING,
                f"Cache health check degraded: {type(e).__name__}",
                cooldown_seconds=int(
                    getattr(settings, "HEALTHCHECK_CACHE_LOG_COOLDOWN_S", 60)
                ),
            )
            return {
                # Degraded by default, since the app can often work without cache.
                "status": HealthStatus.DEGRADED,
                "message": f"Cache connection failed: {type(e).__name__}",
            }

    def _check_disk_space(self) -> Dict[str, Any]:
        """Check available disk space."""
        try:
            import shutil

            base_dir = getattr(settings, "BASE_DIR", None)
            disk_path = str(base_dir) if base_dir else "."
            total, used, free = shutil.disk_usage(disk_path)

            free_percent = (free / total) * 100

            # Configurable thresholds (default: 5% critical, 10% warning)
            critical_threshold = getattr(
                settings, "HEALTHCHECK_DISK_CRITICAL_PERCENT", 5
            )
            warning_threshold = getattr(
                settings, "HEALTHCHECK_DISK_WARNING_PERCENT", 10
            )

            if free_percent < critical_threshold:
                check_status = HealthStatus.UNHEALTHY
                message = f"Critical: Only {free_percent:.1f}% disk space remaining"
            elif free_percent < warning_threshold:
                check_status = HealthStatus.DEGRADED
                message = f"Warning: Only {free_percent:.1f}% disk space remaining"
            else:
                check_status = HealthStatus.HEALTHY
                message = f"{free_percent:.1f}% disk space available"

            return {
                "status": check_status,
                "free_percent": round(free_percent, 2),
                "message": message,
            }
        except Exception as e:
            logger.error(f"Disk space check failed: {e}")
            return {
                "status": HealthStatus.DEGRADED,
                "message": f"Disk check failed: {type(e).__name__}",
            }

    def _check_mpesa(self) -> Dict[str, Any]:
        """
        Check M-Pesa service availability (without making actual API calls).
        This is a lightweight check for configuration only.
        """
        try:
            required_settings = [
                "MPESA_CONSUMER_KEY",
                "MPESA_CONSUMER_SECRET",
                "MPESA_SHORTCODE",
            ]

            missing = [s for s in required_settings if not getattr(settings, s, None)]

            if missing:
                return {
                    "status": HealthStatus.DEGRADED,
                    "message": f'M-Pesa configuration incomplete: {", ".join(missing)}',
                }

            return {
                "status": HealthStatus.HEALTHY,
                "message": "M-Pesa configuration valid",
            }
        except Exception as e:
            logger.error(f"M-Pesa health check failed: {e}")
            return {
                "status": HealthStatus.DEGRADED,
                "message": f"M-Pesa check failed: {type(e).__name__}",
            }


class ReadinessCheckView(APIView):
    """
    Kubernetes-style readiness check.
    Indicates if the application is ready to accept traffic.

    Endpoint: GET /api/health/ready/
    """

    permission_classes = [AllowAny]

    def get(self, request):
        """Check if application is ready to serve requests."""
        # Check critical dependencies only
        db_ok = self._check_database_quick()

        if db_ok:
            return Response({"status": "ready"}, status=status.HTTP_200_OK)
        else:
            return Response(
                {"status": "not_ready"}, status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    def _check_database_quick(self) -> bool:
        """Quick database check."""
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            return True
        except Exception:
            return False


class LivenessCheckView(APIView):
    """
    Kubernetes-style liveness check.
    Indicates if the application is alive and should not be restarted.

    Endpoint: GET /api/health/live/
    """

    permission_classes = [AllowAny]

    def get(self, request):
        """Always returns 200 unless the application is completely broken."""
        return Response({"status": "alive"}, status=status.HTTP_200_OK)


class MetricsView(APIView):
    """
    Basic metrics endpoint for monitoring.
    Returns application metrics in a simple format.

    Endpoint: GET /api/metrics/
    Authentication: Staff/Admin only
    """

    def get(self, request):
        """Return application metrics."""
        if not request.user.is_staff:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        from utils.cache_helpers import get_cache_stats

        metrics = {
            "cache": get_cache_stats(),
            "database": self._get_db_stats(),
            "timestamp": time.time(),
        }

        return Response(metrics)

    def _get_db_stats(self) -> Dict[str, Any]:
        """Get database statistics."""
        try:
            from django.db import connections

            db_conn = connections["default"]

            return {
                "vendor": db_conn.vendor,
                "connection_pool_size": getattr(settings, "DATABASES", {})
                .get("default", {})
                .get("CONN_MAX_AGE", 0),
            }
        except Exception as e:
            logger.error(f"Failed to get DB stats: {e}")
            return {}
