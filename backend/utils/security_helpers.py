"""
Security Helper Functions
Utilities for cryptographic operations, signature verification, and secure data handling.
"""

import hmac
import hashlib
import base64
import secrets
from typing import Dict, Any
from django.conf import settings


def generate_hmac_signature(data: str, secret: str) -> str:
    """
    Generate HMAC-SHA256 signature for data verification.

    Args:
        data: The data to sign (should be string or JSON)
        secret: The secret key for signing

    Returns:
        Base64-encoded HMAC signature
    """
    signature = hmac.new(
        key=secret.encode("utf-8"), msg=data.encode("utf-8"), digestmod=hashlib.sha256
    ).digest()

    return base64.b64encode(signature).decode("utf-8")


def verify_hmac_signature(data: str, signature: str, secret: str) -> bool:
    """
    Verify HMAC signature matches expected value.
    Uses constant-time comparison to prevent timing attacks.

    Args:
        data: The original data
        signature: The signature to verify
        secret: The secret key used for signing

    Returns:
        True if signature is valid, False otherwise
    """
    try:
        expected_signature = generate_hmac_signature(data, secret)
        return hmac.compare_digest(expected_signature, signature)
    except Exception:
        return False


def verify_mpesa_signature(callback_data: Dict[str, Any]) -> bool:
    """
    Verify M-Pesa callback signature to prevent webhook spoofing.

    Args:
        callback_data: The callback payload from M-Pesa

    Returns:
        True if signature is valid or verification disabled (sandbox mode)
    """
    # In production, M-Pesa should sign callbacks with a shared secret
    # For sandbox, signature verification might not be available

    # Skip verification outside production (sandbox callbacks often aren't signed).
    if getattr(settings, "MPESA_ENVIRONMENT", "sandbox") != "production":
        return True

    if not getattr(settings, "MPESA_VERIFY_SIGNATURES", True):
        return True

    # Extract signature from callback headers/body
    signature = callback_data.get("signature") or callback_data.get("X-Signature")

    if not signature:
        # If no signature present and verification required, reject.
        return False

    # Reconstruct payload for verification
    secret = getattr(settings, "MPESA_WEBHOOK_SECRET", "")

    if not secret:
        return False

    # Serialize callback data deterministically
    import json

    payload = json.dumps(
        callback_data.get("Body", {}), sort_keys=True, separators=(",", ":")
    )

    return verify_hmac_signature(payload, signature, secret)


def generate_secure_token(length: int = 32) -> str:
    """
    Generate cryptographically secure random token.

    Args:
        length: Length of token in bytes (default 32)

    Returns:
        Hex-encoded secure random token
    """
    return secrets.token_hex(length)


def mask_phone_number(phone: str) -> str:
    """
    Mask phone number for logging (show only last 4 digits).

    Args:
        phone: Phone number to mask

    Returns:
        Masked phone number (e.g., +254****5678)
    """
    if not phone or len(phone) < 4:
        return "****"

    # Preserve country code prefix if present
    if phone.startswith("+"):
        return phone[:4] + "****" + phone[-4:]
    elif phone.startswith("254"):
        return "254****" + phone[-4:]
    elif phone.startswith("0"):
        return "0****" + phone[-4:]
    else:
        return "****" + phone[-4:]


def mask_email(email: str) -> str:
    """
    Mask email address for logging.

    Args:
        email: Email to mask

    Returns:
        Masked email (e.g., ab***@example.com)
    """
    if not email or "@" not in email:
        return "***@***"

    local, domain = email.split("@", 1)

    if len(local) <= 2:
        masked_local = "***"
    else:
        masked_local = local[:2] + "***"

    return f"{masked_local}@{domain}"
