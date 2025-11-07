"""
Shared validation patterns and constants for authentication and user data.
"""

import re

# Password validation patterns
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128
PASSWORD_UPPERCASE_PATTERN = r"[A-Z]"
PASSWORD_LOWERCASE_PATTERN = r"[a-z]"
PASSWORD_DIGIT_PATTERN = r"\d"
PASSWORD_SPECIAL_CHAR_PATTERN = r'[!@#$%^&*(),.?":{}|<>]'

# Username validation patterns
USERNAME_MIN_LENGTH = 3
USERNAME_MAX_LENGTH = 150
USERNAME_PATTERN = r'^[a-zA-Z0-9_.-]+$'

# Phone validation pattern (international format)
PHONE_PATTERN = r'^\+?[1-9]\d{1,14}$'

# Address validation
ADDRESS_MIN_LENGTH = 10
ADDRESS_MAX_LENGTH = 500


def validate_password_strength(password):
    """
    Validate password strength.
    Returns (is_valid, error_message)
    """
    if len(password) < PASSWORD_MIN_LENGTH:
        return False, f"Password must be at least {PASSWORD_MIN_LENGTH} characters long."
    
    if len(password) > PASSWORD_MAX_LENGTH:
        return False, f"Password must not exceed {PASSWORD_MAX_LENGTH} characters."
    
    if not re.search(PASSWORD_UPPERCASE_PATTERN, password):
        return False, "Password must contain at least one uppercase letter."
    
    if not re.search(PASSWORD_LOWERCASE_PATTERN, password):
        return False, "Password must contain at least one lowercase letter."
    
    if not re.search(PASSWORD_DIGIT_PATTERN, password):
        return False, "Password must contain at least one digit."
    
    if not re.search(PASSWORD_SPECIAL_CHAR_PATTERN, password):
        return False, "Password must contain at least one special character."
    
    return True, ""


def validate_phone_number(phone):
    """
    Validate phone number format.
    Returns (is_valid, error_message)
    """
    if phone and not re.match(PHONE_PATTERN, phone):
        return False, "Please enter a valid phone number in international format."
    return True, ""


def validate_username(username):
    """
    Validate username format.
    Returns (is_valid, error_message)
    """
    if len(username) < USERNAME_MIN_LENGTH:
        return False, f"Username must be at least {USERNAME_MIN_LENGTH} characters long."
    
    if len(username) > USERNAME_MAX_LENGTH:
        return False, f"Username must not exceed {USERNAME_MAX_LENGTH} characters."
    
    if not re.match(USERNAME_PATTERN, username):
        return False, "Username can only contain letters, numbers, dots, hyphens, and underscores."
    
    return True, ""
