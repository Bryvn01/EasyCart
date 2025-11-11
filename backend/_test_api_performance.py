import requests
import time


def test_endpoint(url, name):
    """Test an endpoint 5 times and calculate average"""
    times = []

    for i in range(5):
        start = time.time()
        try:
            response = requests.get(url, timeout=10)
            end = time.time()
            elapsed = (end - start) * 1000  # Convert to milliseconds
            times.append(elapsed)

            if response.status_code == 200:
                status = "PASS"
            else:
                status = "FAIL"

            print(
                f"  Request {i+1}: {status} {elapsed:.0f}ms (Status {response.status_code})"
            )
        except Exception as e:
            print(f"  Request {i+1}: FAIL ERROR - {str(e)}")
            return None

    avg = sum(times) / len(times)
    fastest = min(times)
    slowest = max(times)

    return {"average": avg, "fastest": fastest, "slowest": slowest, "times": times}


print("\n" + "=" * 70)
print("  API PERFORMANCE TEST")
print("=" * 70 + "\n")

# Test Products API
print("[TEST 1] Products API (20 items)")
result = test_endpoint(
    "http://localhost:8000/api/products/?page=1&page_size=20", "Products"
)

if result:
    print(f"\n  Average: {result['average']:.0f}ms")
    print(f"  Fastest: {result['fastest']:.0f}ms")
    print(f"  Slowest: {result['slowest']:.0f}ms")

    if result["average"] < 300:
        print(f"  [SUCCESS] Performance: EXCELLENT (Target: <300ms)")
        grade = "A+"
    elif result["average"] < 500:
        print(f"  [GOOD] Performance: VERY GOOD (Target: <300ms)")
        grade = "A"
    elif result["average"] < 1000:
        print(f"  [WARNING] Performance: GOOD")
        grade = "B"
    else:
        print(f"  [WARNING] Performance: NEEDS IMPROVEMENT")
        grade = "C"

# Test Categories API
print(f"\n[TEST 2] Categories API")
result2 = test_endpoint("http://localhost:8000/api/products/categories/", "Categories")

if result2:
    print(f"\n  Average: {result2['average']:.0f}ms")
    print(f"  Fastest: {result2['fastest']:.0f}ms")
    print(f"  Slowest: {result2['slowest']:.0f}ms")

    if result2["average"] < 200:
        print(f"  [SUCCESS] Performance: EXCELLENT (Target: <200ms)")
        grade2 = "A+"
    elif result2["average"] < 300:
        print(f"  [GOOD] Performance: VERY GOOD")
        grade2 = "A"
    else:
        print(f"  [WARNING] Performance: GOOD")
        grade2 = "B"

# Summary
print(f"\n" + "=" * 70)
print("  PERFORMANCE SUMMARY")
print("=" * 70)

if result and result2:
    print(f"  Products API: {result['average']:.0f}ms (Grade: {grade})")
    print(f"  Categories API: {result2['average']:.0f}ms (Grade: {grade2})")

    if grade in ["A+", "A"] and grade2 in ["A+", "A"]:
        print(f"\n  [SUCCESS] Enterprise-Grade Performance Achieved!")
        print(f"  [READY] Ready for Production Deployment")
    else:
        print(f"\n  [INFO] Performance is good but could be optimized further")
else:
    print(f"  [FAIL] Some tests failed - check server status")

print("=" * 70 + "\n")
