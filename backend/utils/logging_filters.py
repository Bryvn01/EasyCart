"""
PII Protection Logging Filters
Masks sensitive data (phone numbers, emails) in log messages to ensure GDPR/PDPA compliance.
"""

import re
import logging


class PIIMaskingFilter(logging.Filter):
    """
    Filter to mask Personally Identifiable Information (PII) in log messages.
    Complies with Kenya Data Protection Act 2019 and GDPR principles.
    """

    # Regex patterns for PII detection
    PATTERNS = {
        # Kenyan phone numbers: +254... or 07... or 01...
        "phone": [
            (r"\+254\d{9}", lambda m: "+254****" + m.group()[-4:]),
            (r"\b0[71]\d{8}\b", lambda m: "07****" + m.group()[-4:]),
            (r"254\d{9}", lambda m: "254****" + m.group()[-4:]),
        ],
        # Email addresses
        "email": [
            (
                r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
                lambda m: m.group().split("@")[0][:2]
                + "***@"
                + m.group().split("@")[1],
            ),
        ],
        # M-Pesa transaction IDs (keep last 4 chars for support)
        "mpesa_tx": [
            (
                r"\b[A-Z0-9]{10,}\b",
                lambda m: "****" + m.group()[-4:] if len(m.group()) > 8 else m.group(),
            ),
        ],
        # API keys and tokens (generic pattern)
        "api_key": [
            (
                r'(?i)(api[_-]?key|token|secret|password)[\s:=]+["\']?([A-Za-z0-9_\-]{16,})["\']?',
                lambda m: f"{m.group(1)}=****{m.group(2)[-4:]}",
            ),
        ],
    }

    def filter(self, record):
        """
        Mask PII in log record message.
        Returns True to allow the record to be logged.
        """
        if hasattr(record, "getMessage"):
            original_msg = record.getMessage()
            masked_msg = self._mask_pii(original_msg)
            record.msg = masked_msg
            record.args = ()  # Clear args to prevent re-formatting

        return True

    def _mask_pii(self, text: str) -> str:
        """Apply all masking patterns to text."""
        masked = text

        for category, patterns in self.PATTERNS.items():
            for pattern, replacer in patterns:
                try:
                    masked = re.sub(pattern, replacer, masked)
                except Exception as e:
                    # Don't break logging if regex fails
                    logging.error(f"PII masking error for {category}: {e}")

        return masked


class CorrelationIDFilter(logging.Filter):
    """
    Inject correlation ID (request ID) into log records for request tracing.
    """

    def filter(self, record):
        # Try to get correlation ID from thread-local storage
        from threading import current_thread

        thread = current_thread()

        correlation_id = getattr(thread, "correlation_id", None)
        record.correlation_id = correlation_id or "N/A"

        return True


class SensitiveDataFilter(logging.Filter):
    """
    Additional filter for blocking logs containing specific sensitive keywords.
    """

    BLOCKED_KEYWORDS = [
        "password=",
        "passwd=",
        "secret_key=",
        "api_secret=",
        "private_key=",
    ]

    def filter(self, record):
        msg = record.getMessage().lower()

        for keyword in self.BLOCKED_KEYWORDS:
            if keyword in msg:
                record.msg = f"[SENSITIVE DATA BLOCKED - contained '{keyword}']"
                record.args = ()
                break

        return True
