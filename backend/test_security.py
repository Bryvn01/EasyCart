"""
Test script for security validation
"""

from apps.support.security import MessageSecurityValidator

# Test cases
test_cases = [
    # XSS attempts
    ("<script>alert('XSS')</script>Hello", False, "XSS in script tag"),
    ("<img src=x onerror=alert('XSS')>", False, "XSS in image tag"),
    ("javascript:alert(1)", False, "JavaScript protocol"),
    # Malicious URLs
    ("Check out http://192.168.1.1/phishing", False, "IP address URL"),
    ("Visit http://example.tk for prizes", False, "Suspicious TLD"),
    ("Go to https://bit.ly/scam123", False, "Blacklisted domain"),
    # Spam
    ("You won the lottery! Claim your prize now!", False, "Lottery spam"),
    ("Congratulations you won $1000000 in bitcoin giveaway", False, "Bitcoin spam"),
    ("Your account has unusual activity. Verify here.", False, "Phishing spam"),
    # Valid messages
    ("I need help with my order #12345", True, "Normal support request"),
    ("Can you help me with shipping?", True, "Simple question"),
    ("Visit https://google.com for more info", True, "Valid URL"),
    ("My tracking number is ABC123XYZ", True, "Tracking number"),
]

print("=" * 80)
print("SECURITY VALIDATION TEST RESULTS")
print("=" * 80)

passed = 0
failed = 0

for message, should_pass, description in test_cases:
    is_valid, sanitized, error = MessageSecurityValidator.validate_message(message)

    if (is_valid and should_pass) or (not is_valid and not should_pass):
        status = "✅ PASS"
        passed += 1
    else:
        status = "❌ FAIL"
        failed += 1

    print(f"\n{status} - {description}")
    print(f"Input: {message[:60]}...")
    print(
        f"Expected: {'VALID' if should_pass else 'BLOCKED'}, Got: {'VALID' if is_valid else 'BLOCKED'}"
    )
    if not is_valid:
        print(f"Error: {error}")

print("\n" + "=" * 80)
print(f"RESULTS: {passed} passed, {failed} failed out of {len(test_cases)} tests")
print("=" * 80)
