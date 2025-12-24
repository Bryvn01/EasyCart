import subprocess
import sys

print("=" * 70)
print("RUNNING DJANGO TESTS")
print("=" * 70)

# Run tests
result = subprocess.run(
    ["python", "manage.py", "test", "--noinput", "--verbosity=2"],
    capture_output=True,
    text=True,
    cwd=r"C:\EasyCart\backend",
)

# Print stdout
if result.stdout:
    lines = result.stdout.split("\n")
    for line in lines:
        if any(
            keyword in line
            for keyword in [
                "Ran ",
                "OK",
                "FAILED",
                "FAIL:",
                "ERROR:",
                "failures=",
                "errors=",
            ]
        ):
            print(line)

# Print stderr if there are errors
if result.stderr:
    print("\nERRORS:")
    lines = result.stderr.split("\n")
    for line in lines[-50:]:  # Last 50 lines of errors
        if line.strip():
            print(line)

# Print summary
print("\n" + "=" * 70)
if result.returncode == 0:
    print("✅ ALL TESTS PASSED")
else:
    print(f"❌ TESTS FAILED (Exit code: {result.returncode})")
print("=" * 70)

sys.exit(result.returncode)
