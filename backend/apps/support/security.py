"""
Security utilities for chat message validation and sanitization
"""

import re
import urllib.parse
from typing import List, Tuple


class MessageSecurityValidator:
    """Comprehensive security validation for chat messages"""

    # Dangerous HTML tags that should be blocked
    DANGEROUS_TAGS = [
        "script",
        "iframe",
        "object",
        "embed",
        "applet",
        "meta",
        "link",
        "style",
        "form",
        "input",
        "button",
    ]

    # JavaScript event handlers
    EVENT_HANDLERS = [
        "onclick",
        "onload",
        "onerror",
        "onmouseover",
        "onmouseout",
        "onfocus",
        "onblur",
        "onchange",
        "onsubmit",
        "onkeypress",
        "onkeydown",
        "onkeyup",
        "ondblclick",
        "oncontextmenu",
    ]

    # Malicious URL patterns
    MALICIOUS_PATTERNS = [
        r"javascript:",
        r"data:text/html",
        r"vbscript:",
        r"file://",
        r"about:",
    ]

    # Known malicious domains (example list - expand as needed)
    BLACKLISTED_DOMAINS = [
        "bit.ly",  # Often used for phishing (can whitelist if needed)
        "tinyurl.com",  # Often used for phishing
        # Add known malicious domains here
    ]

    # Spam/scam keywords
    SPAM_KEYWORDS = [
        "viagra",
        "cialis",
        "casino",
        "lottery",
        "prize winner",
        "congratulations you won",
        "claim your prize",
        "free money",
        "nigerian prince",
        "inheritance",
        "bitcoin giveaway",
        "click here now",
        "limited time offer",
        "act now",
        "verify your account",
        "suspended account",
        "unusual activity",
    ]

    @staticmethod
    def sanitize_html(text: str) -> str:
        """Remove all HTML tags and entities"""
        # Remove script tags and their content
        text = re.sub(
            r"<script[^>]*>.*?</script>", "", text, flags=re.IGNORECASE | re.DOTALL
        )
        text = re.sub(
            r"<style[^>]*>.*?</style>", "", text, flags=re.IGNORECASE | re.DOTALL
        )

        # Remove all HTML tags
        text = re.sub(r"<[^>]+>", "", text)

        # Decode HTML entities
        text = text.replace("&lt;", "<").replace("&gt;", ">")
        text = text.replace("&quot;", '"').replace("&#39;", "'")
        text = text.replace("&amp;", "&")

        # Remove any remaining HTML-like patterns
        text = re.sub(r"&[a-zA-Z]+;", "", text)
        text = re.sub(r"&#\d+;", "", text)

        return text.strip()

    @staticmethod
    def detect_xss_attempts(text: str) -> bool:
        """Detect potential XSS attack patterns"""
        text_lower = text.lower()

        # Check for dangerous tags
        for tag in MessageSecurityValidator.DANGEROUS_TAGS:
            if f"<{tag}" in text_lower or f"</{tag}>" in text_lower:
                return True

        # Check for event handlers
        for handler in MessageSecurityValidator.EVENT_HANDLERS:
            if handler in text_lower:
                return True

        # Check for malicious URL patterns
        for pattern in MessageSecurityValidator.MALICIOUS_PATTERNS:
            if re.search(pattern, text_lower):
                return True

        return False

    @staticmethod
    def extract_urls(text: str) -> List[str]:
        """Extract all URLs from text"""
        url_pattern = r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+"
        return re.findall(url_pattern, text)

    @staticmethod
    def validate_url(url: str) -> Tuple[bool, str]:
        """
        Validate a URL for security issues
        Returns: (is_safe, reason)
        """
        try:
            parsed = urllib.parse.urlparse(url)

            # Check for malicious protocols
            if parsed.scheme not in ["http", "https"]:
                return False, f"Suspicious protocol: {parsed.scheme}"

            # Check for blacklisted domains
            domain = parsed.netloc.lower()
            for blacklisted in MessageSecurityValidator.BLACKLISTED_DOMAINS:
                if blacklisted in domain:
                    return False, f"Blacklisted domain: {blacklisted}"

            # Check for IP addresses (often used in phishing)
            ip_pattern = r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}"
            if re.match(ip_pattern, domain):
                return False, "IP addresses not allowed in URLs"

            # Check for suspicious TLDs
            suspicious_tlds = [
                ".tk",
                ".ml",
                ".ga",
                ".cf",
                ".gq",
                ".xyz",
            ]  # Free domains often used for spam
            if any(domain.endswith(tld) for tld in suspicious_tlds):
                return False, "Suspicious domain extension"

            return True, "URL is valid"

        except Exception as e:
            return False, f"Invalid URL format: {str(e)}"

    @staticmethod
    def check_spam_content(text: str) -> Tuple[bool, List[str]]:
        """
        Check if message contains spam keywords
        Returns: (is_spam, matched_keywords)
        """
        text_lower = text.lower()
        matched = []

        for keyword in MessageSecurityValidator.SPAM_KEYWORDS:
            if keyword in text_lower:
                matched.append(keyword)

        return len(matched) > 0, matched

    @staticmethod
    def validate_message(text: str, allow_urls: bool = True) -> Tuple[bool, str, str]:
        """
        Comprehensive message validation
        Returns: (is_valid, sanitized_text, error_message)
        """
        # 1. Sanitize HTML
        sanitized = MessageSecurityValidator.sanitize_html(text)

        # 2. Check length
        if len(sanitized) < 1:
            return False, "", "Message cannot be empty"

        if len(sanitized) > 5000:
            return False, "", "Message too long (max 5000 characters)"

        # 3. Detect XSS attempts
        if MessageSecurityValidator.detect_xss_attempts(text):
            return False, "", "Message contains potentially malicious code"

        # 4. Check for spam
        is_spam, spam_keywords = MessageSecurityValidator.check_spam_content(sanitized)
        if is_spam:
            return (
                False,
                "",
                f"Message appears to contain spam: {', '.join(spam_keywords[:3])}",
            )

        # 5. Validate URLs if present
        urls = MessageSecurityValidator.extract_urls(sanitized)
        if urls:
            if not allow_urls:
                return False, "", "URLs are not allowed in messages"

            for url in urls:
                is_safe, reason = MessageSecurityValidator.validate_url(url)
                if not is_safe:
                    return False, "", f"Suspicious URL detected: {reason}"

        # 6. Check for excessive special characters (potential obfuscation)
        special_char_ratio = len(re.findall(r"[^a-zA-Z0-9\s]", sanitized)) / max(
            len(sanitized), 1
        )
        if special_char_ratio > 0.3:  # More than 30% special characters
            return False, "", "Message contains excessive special characters"

        # 7. Check for excessive caps (shouting/spam indicator)
        caps_ratio = len(re.findall(r"[A-Z]", sanitized)) / max(
            len(re.findall(r"[a-zA-Z]", sanitized)), 1
        )
        if (
            caps_ratio > 0.7 and len(sanitized) > 20
        ):  # More than 70% caps in messages longer than 20 chars
            return False, "", "Message contains excessive capital letters"

        return True, sanitized, ""

    @staticmethod
    def rate_limit_check(user_identifier: str, redis_client=None) -> bool:
        """
        Check if user is sending too many messages (rate limiting)
        Note: Requires Redis for production use
        """
        # TODO: Implement with Redis in production
        # For now, this is handled by DRF throttling
        return True
