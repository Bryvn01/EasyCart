"""
Device Fingerprinting Service
Creates unique device fingerprints for session security and anomaly detection
"""

import hashlib
import json
from django.core.cache import cache
from datetime import timedelta
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


def generate_device_fingerprint(request):
    """
    Generate a device fingerprint from request metadata

    Args:
        request: Django HTTP request object

    Returns:
        str: Device fingerprint hash
    """
    # Collect device information
    user_agent = request.META.get("HTTP_USER_AGENT", "")
    accept_language = request.META.get("HTTP_ACCEPT_LANGUAGE", "")
    accept_encoding = request.META.get("HTTP_ACCEPT_ENCODING", "")

    # Create fingerprint string
    fingerprint_data = f"{user_agent}|{accept_language}|{accept_encoding}"

    # Hash for privacy and consistency
    fingerprint_hash = hashlib.sha256(fingerprint_data.encode()).hexdigest()

    return fingerprint_hash


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


def track_device_login(user, request, token=None):
    """
    Track device login for security monitoring

    Args:
        user: User instance
        request: HTTP request
        token: Optional JWT token to associate

    Returns:
        dict: Device session info
    """
    device_fp = generate_device_fingerprint(request)
    ip_address = get_client_ip(request)
    user_agent = request.META.get("HTTP_USER_AGENT", "")[:200]

    session_data = {
        "device_fingerprint": device_fp,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "login_time": timezone.now().isoformat(),
        "user_id": user.id,
    }

    # Store in cache with 7-day expiry (same as refresh token)
    cache_key = f"device_session:{user.id}:{device_fp}"
    cache.set(cache_key, json.dumps(session_data), timeout=7 * 24 * 3600)

    # Track all user devices
    user_devices_key = f"user_devices:{user.id}"
    user_devices = cache.get(user_devices_key, [])

    # Add new device if not already tracked
    if device_fp not in [d.get("device_fingerprint") for d in user_devices]:
        user_devices.append(
            {
                "fingerprint": device_fp,
                "ip": ip_address,
                "user_agent": user_agent[:50],
                "first_seen": timezone.now().isoformat(),
                "last_seen": timezone.now().isoformat(),
            }
        )
    else:
        # Update last seen
        for device in user_devices:
            if device["fingerprint"] == device_fp:
                device["last_seen"] = timezone.now().isoformat()
                device["ip"] = ip_address

    cache.set(user_devices_key, user_devices, timeout=30 * 24 * 3600)  # 30 days

    logger.info(f"Device login tracked for user {user.id} from {ip_address}")

    return session_data


def verify_device_fingerprint(user, request):
    """
    Verify if request comes from a known device

    Args:
        user: User instance
        request: HTTP request

    Returns:
        tuple: (is_known: bool, device_info: dict)
    """
    device_fp = generate_device_fingerprint(request)
    cache_key = f"device_session:{user.id}:{device_fp}"

    session_data = cache.get(cache_key)

    if session_data:
        try:
            data = (
                json.loads(session_data)
                if isinstance(session_data, str)
                else session_data
            )
            return True, data
        except (TypeError, ValueError, json.JSONDecodeError):
            return False, None

    return False, None


def detect_suspicious_activity(user, request):
    """
    Detect potentially suspicious login activity

    Args:
        user: User instance
        request: HTTP request

    Returns:
        tuple: (is_suspicious: bool, reason: str)
    """
    current_ip = get_client_ip(request)
    device_fp = generate_device_fingerprint(request)

    # Get user's device history
    user_devices_key = f"user_devices:{user.id}"
    user_devices = cache.get(user_devices_key, [])

    # Check if device is known
    device_known = any(d["fingerprint"] == device_fp for d in user_devices)

    # Check for IP changes within short time
    recent_logins_key = f"recent_logins:{user.id}"
    recent_logins = cache.get(recent_logins_key, [])

    # Add current login
    recent_logins.append(
        {"ip": current_ip, "time": timezone.now().isoformat(), "device_fp": device_fp}
    )

    # Keep only last 10 logins
    recent_logins = recent_logins[-10:]
    cache.set(recent_logins_key, recent_logins, timeout=24 * 3600)  # 24 hours

    # Analyze patterns
    if len(recent_logins) >= 2:
        last_login = recent_logins[-2]
        last_ip = last_login["ip"]
        last_time = timezone.datetime.fromisoformat(last_login["time"])

        # Different IP within 1 hour
        time_diff = timezone.now() - last_time
        if last_ip != current_ip and time_diff < timedelta(hours=1):
            if not device_known:
                return True, "Rapid location change with new device"

    # Multiple failed attempts recently (would need to track this separately)
    failed_attempts_key = f"failed_logins:{user.id}"
    failed_attempts = cache.get(failed_attempts_key, 0)
    if failed_attempts > 3:
        return True, "Multiple recent failed login attempts"

    # New device from different country (basic check)
    if not device_known and len(user_devices) > 0:
        # In production, you'd use GeoIP to check country
        return False, "New device detected (monitoring)"

    return False, "Normal activity"


def get_user_devices(user):
    """Get list of all devices for a user"""
    user_devices_key = f"user_devices:{user.id}"
    devices = cache.get(user_devices_key, [])
    return devices


def revoke_device(user, device_fingerprint):
    """
    Revoke a specific device's access

    Args:
        user: User instance
        device_fingerprint: Device fingerprint to revoke

    Returns:
        bool: Success status
    """
    try:
        # Remove from active sessions
        cache_key = f"device_session:{user.id}:{device_fingerprint}"
        cache.delete(cache_key)

        # Remove from user devices list
        user_devices_key = f"user_devices:{user.id}"
        devices = cache.get(user_devices_key, [])
        devices = [d for d in devices if d["fingerprint"] != device_fingerprint]
        cache.set(user_devices_key, devices, timeout=30 * 24 * 3600)

        logger.info(f"Device {device_fingerprint[:8]}... revoked for user {user.id}")
        return True
    except Exception as e:
        logger.error(f"Failed to revoke device: {e}")
        return False


def revoke_all_devices(user, except_current=None):
    """
    Revoke all devices for a user (e.g., after password change)

    Args:
        user: User instance
        except_current: Current device fingerprint to keep (optional)

    Returns:
        int: Number of devices revoked
    """
    try:
        devices = get_user_devices(user)
        revoked_count = 0

        for device in devices:
            fp = device["fingerprint"]
            if except_current and fp == except_current:
                continue

            if revoke_device(user, fp):
                revoked_count += 1

        logger.info(f"Revoked {revoked_count} devices for user {user.id}")
        return revoked_count
    except Exception as e:
        logger.error(f"Failed to revoke all devices: {e}")
        return 0
