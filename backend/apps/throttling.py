"""
Custom Throttle Classes for DRF API Rate Limiting
Implements sophisticated rate limiting for different endpoint types.
"""

from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django.core.cache import cache
import time


class PaymentRateThrottle(UserRateThrottle):
    """
    Rate limit for payment endpoints to prevent abuse.
    Limit: 10 payment attempts per minute per user/IP
    """

    scope = "payment"
    rate = "10/min"

    def get_cache_key(self, request, view):
        """
        Use user ID if authenticated, IP address otherwise.
        """
        if request.user and request.user.is_authenticated:
            ident = str(request.user.id)
        else:
            ident = self.get_ident(request)

        return f"throttle_payment_{ident}"

    def allow_request(self, request, view):
        """
        Custom logic to allow request or deny based on rate limit.
        """
        allowed = super().allow_request(request, view)

        if not allowed:
            # Log rate limit exceeded for security monitoring
            import logging

            logger = logging.getLogger("audit")
            logger.warning(
                f"Payment rate limit exceeded - "
                f"User: {request.user.id if request.user.is_authenticated else 'Anonymous'}, "
                f"IP: {self.get_ident(request)}"
            )

        return allowed


class OTPRateThrottle(UserRateThrottle):
    """
    Rate limit for OTP generation endpoints.
    Limit: 5 OTPs per hour per user/phone number
    """

    scope = "otp"
    rate = "5/hour"

    def get_cache_key(self, request, view):
        """
        Use phone number from request if available, otherwise user ID or IP.
        """
        phone = request.data.get("phone_number") or request.data.get("phone")

        if phone:
            # Use phone number as identifier
            return f"throttle_otp_phone_{phone}"
        elif request.user and request.user.is_authenticated:
            return f"throttle_otp_user_{request.user.id}"
        else:
            return f"throttle_otp_ip_{self.get_ident(request)}"


class BurstRateThrottle(UserRateThrottle):
    """
    Burst rate limiting for authenticated users.
    Allows higher burst but enforces sustained limit.
    Limit: 60 requests per minute (burst), 1000 per hour (sustained)
    """

    scope = "burst"
    rate = "60/min"


class SustainedRateThrottle(UserRateThrottle):
    """
    Sustained rate limiting for authenticated users.
    """

    scope = "sustained"
    rate = "1000/hour"


class StrictAnonRateThrottle(AnonRateThrottle):
    """
    Strict rate limiting for anonymous users.
    Limit: 100 requests per hour
    """

    scope = "strict_anon"
    rate = "100/hour"


class LoginRateThrottle(AnonRateThrottle):
    """
    Rate limit for login attempts to prevent brute force attacks.
    Limit: 5 login attempts per 5 minutes per IP
    """

    scope = "login"
    rate = "5/5min"

    def get_cache_key(self, request, view):
        """
        Use IP address + username for more granular control.
        """
        username = request.data.get("email") or request.data.get("username", "")
        ip = self.get_ident(request)

        if username:
            # Rate limit per IP + username combination
            return f"throttle_login_{ip}_{username}"
        else:
            # Fallback to IP only
            return f"throttle_login_{ip}"

    def allow_request(self, request, view):
        """
        Log failed login attempts for security monitoring.
        """
        allowed = super().allow_request(request, view)

        if not allowed:
            import logging

            logger = logging.getLogger("audit")
            logger.warning(
                f"Login rate limit exceeded - "
                f"IP: {self.get_ident(request)}, "
                f"Username: {request.data.get('email', 'N/A')}"
            )

        return allowed


class RegistrationRateThrottle(AnonRateThrottle):
    """
    Rate limit for registration to prevent spam accounts.
    Limit: 3 registrations per hour per IP
    """

    scope = "registration"
    rate = "3/hour"


# IP-based progressive slowdown for repeated violations
class ProgressiveThrottle(UserRateThrottle):
    """
    Progressive throttling that increases delay based on violation count.
    First violation: warning
    Second violation: 5 second delay
    Third+ violation: exponential backoff up to 60 seconds
    """

    scope = "progressive"
    rate = "100/min"

    def throttle_failure(self):
        """
        Called when request is throttled. Implements progressive delay.
        """
        cache_key = self.get_cache_key(self.request, self.view)
        violation_key = f"{cache_key}_violations"

        # Track violation count
        violations = cache.get(violation_key, 0) + 1
        cache.set(violation_key, violations, timeout=3600)  # Track for 1 hour

        # Calculate delay (exponential backoff)
        if violations == 1:
            delay = 0  # Warning only
        elif violations == 2:
            delay = 5
        else:
            delay = min(5 * (2 ** (violations - 2)), 60)  # Max 60 seconds

        if delay > 0:
            time.sleep(delay)

        return super().throttle_failure()
