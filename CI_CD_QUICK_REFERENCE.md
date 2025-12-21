# CI/CD Quick Reference Guide

## 🚀 Running Tests

### Basic Test Commands
```bash
# Run all tests
cd backend
python manage.py test --noinput

# Run with verbosity
python manage.py test --noinput --verbosity=2

# Run specific app tests
python manage.py test apps.accounts --noinput
python manage.py test apps.products --noinput

# Run specific test class
python manage.py test apps.accounts.test_auth.AuthenticationTests --noinput

# Run specific test method
python manage.py test apps.accounts.test_auth.AuthenticationTests.test_user_registration --noinput

# Parallel execution (faster)
python manage.py test --noinput --parallel=2

# Keep test database (faster repeated runs)
python manage.py test --noinput --keepdb
```

## 🔍 Test Debugging

### If Tests Fail to Run

#### ImportError: 'tests' module incorrectly imported
**Cause**: Nested `tests/` directory conflicts with Django test discovery  
**Solution**: Remove `tests/` subdirectories, use flat structure with `test_*.py` files

#### Migration conflicts (column already exists)
**Cause**: Migration marked unapplied but columns exist  
**Solution**:
```bash
# Check migration status
python manage.py showmigrations accounts

# Verify database schema
python manage.py dbshell
\d accounts_user;  # List columns

# Fake-apply if columns exist
python manage.py migrate accounts 0011 --fake
```

#### NameError: 'logger' is not defined
**Cause**: Missing logger import/initialization  
**Solution**: Add to module:
```python
import logging
logger = logging.getLogger(__name__)
```

#### IndentationError in Python files
**Cause**: Malformed code after editing  
**Solution**: 
```bash
# Check syntax
python -m py_compile apps/accounts/views.py
```

## 📊 Test Output Interpretation

### Successful Run
```
Ran 195 tests in 500.0s
OK (skipped=28)
```
- ✅ All tests passed
- 28 tests skipped (intentional - features not implemented yet)

### Failed Run
```
Ran 195 tests in 500.0s
FAILED (failures=1, errors=2)
```
- ❌ 1 assertion failure (test logic failed)
- ❌ 2 errors (exceptions/crashes during test)

## 🗃️ Database Management

### Reset Test Database
```bash
# Drop test database (if exists warnings)
psql -U easycart -c "DROP DATABASE IF EXISTS test_easycart;"

# Or keep database for faster runs
python manage.py test --keepdb --noinput
```

### Check Database Schema
```bash
# Connect to database
python manage.py dbshell

# List tables
\dt

# Describe table structure
\d accounts_user;
\d accounts_historicaluser;

# Check specific columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'accounts_user';
```

## 🔧 Migration Troubleshooting

### View Migration Status
```bash
# Show all migrations
python manage.py showmigrations

# Show migrations for specific app
python manage.py showmigrations accounts

# View SQL for migration
python manage.py sqlmigrate accounts 0011
```

### Common Migration Issues

#### Unapplied migration but columns exist
```bash
# Fake-apply the migration
python manage.py migrate accounts 0011 --fake
```

#### Rollback migration
```bash
# Rollback to previous migration
python manage.py migrate accounts 0010
```

#### Create new migration
```bash
python manage.py makemigrations accounts
```

## 📝 CI/CD Configuration

### GitHub Actions Test Command
```yaml
# From .github/workflows/ci.yml
- name: Run tests
  run: |
    cd backend
    python manage.py test --verbosity=2 --parallel=2 --noinput
```

### Codecov Configuration
File: `codecov.yml`
```yaml
coverage:
  status:
    project:
      default:
        target: 85%
        threshold: 2%
        require_base: false  # Must be boolean, not 'no'
        require_head: true   # Must be boolean, not 'yes'
```

## 🧪 Test File Structure (Best Practices)

### ✅ Correct Structure
```
backend/
├── apps/
│   ├── accounts/
│   │   ├── test_auth.py          # Flat structure
│   │   ├── test_security_fixes.py
│   │   ├── test_security_features_month2.py
│   │   └── views.py
│   ├── products/
│   │   ├── test_products.py
│   │   └── models.py
└── tests/
    └── test_security.py
```

### ❌ Incorrect Structure (causes ImportError)
```
backend/
├── apps/
│   ├── accounts/
│   │   ├── tests/              # ❌ Don't nest tests/ directory
│   │   │   └── test_security_features.py
│   │   └── views.py
```

## 🔒 Security Feature Tests

### Email Verification
```python
from apps.accounts.email_verification_service import (
    send_verification_email,
    verify_email_token,
    get_verification_status
)

# Check status
status = get_verification_status(user)
assert status['email_verified'] == False
assert status['can_resend'] == True
```

### JWT Rotation
```python
from apps.accounts.management.commands.rotate_jwt_key import JWTKeyRotation

# Rotate keys
rotation = JWTKeyRotation()
success, message = rotation.rotate_key()

# Check active keys (max 3)
active_keys = rotation.get_all_active_keys()
assert len(active_keys) <= 3
```

### Device Fingerprinting
```python
from apps.accounts.device_fingerprint_service import (
    track_device_login,
    detect_suspicious_activity,
    verify_device_fingerprint
)

# Track login
track_device_login(user, request, device_fingerprint)

# Check for suspicious activity
is_suspicious, reason = detect_suspicious_activity(user, device_fingerprint)
```

## 🐛 Common Test Failures

### 1. Password Policy Tests
**Error**: `AssertionError: 500 != 201`  
**Cause**: Server error in password validation  
**Check**: Pwned password API, password validators in settings

### 2. JWT Rotation Tests
**Error**: `AssertionError: 4 not less than or equal to 3`  
**Cause**: Too many active keys (including fallback SECRET_KEY)  
**Fix**: Only add fallback if no rotated keys exist

### 3. Email Verification Tests
**Error**: `KeyError: 'email_verified'`  
**Cause**: Function returns wrong key name  
**Fix**: Return `email_verified` not `verified`

## 📦 Environment Setup

### Required Packages
```bash
# Install dependencies
pip install -r requirements.txt

# Key packages for testing
pip install django djangorestframework pytest pytest-django coverage
```

### Environment Variables
```bash
# .env file
DJANGO_SETTINGS_MODULE=ecommerce.settings
DATABASE_URL=postgresql://easycart:password@localhost:5432/easycart
SECRET_KEY=your-secret-key-here
DEBUG=True

# For tests
TEST_DATABASE_NAME=test_easycart
```

## 🎯 Test Coverage

### Run with Coverage
```bash
# Install coverage
pip install coverage

# Run tests with coverage
coverage run --source='.' manage.py test --noinput
coverage report
coverage html  # Generate HTML report

# View report
open htmlcov/index.html
```

### Coverage Thresholds
- **Target**: 85% coverage
- **Minimum**: 70% coverage
- **Critical paths**: 95%+ coverage (auth, payments, security)

## 📚 Resources

- Django Testing: https://docs.djangoproject.com/en/stable/topics/testing/
- DRF Testing: https://www.django-rest-framework.org/api-guide/testing/
- GitHub Actions: https://docs.github.com/en/actions
- Codecov: https://docs.codecov.com/

## ✅ Pre-Commit Checklist

Before pushing code:
- [ ] Run full test suite: `python manage.py test --noinput`
- [ ] Check for syntax errors: `python -m py_compile apps/**/*.py`
- [ ] Verify migrations applied: `python manage.py migrate --check`
- [ ] Run linting: `flake8 apps/ tests/`
- [ ] Check coverage: `coverage run manage.py test && coverage report`
- [ ] Review changes: `git diff`
- [ ] Write meaningful commit message

---

**Last Updated**: December 21, 2025  
**Test Status**: ✅ 195 tests passing, 0 failures  
**CI/CD Status**: ✅ Ready for deployment
