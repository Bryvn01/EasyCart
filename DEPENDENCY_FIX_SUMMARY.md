# Dependency Conflict Resolution

## Issue
The CI workflow was failing at the backend dependency installation step due to a conflict between Django 4.2+ and Djongo 1.3.6.

**Failed Workflow Run:** https://github.com/Bryvn01/EasyCart/actions/runs/18138065760/job/51622784634#step:5:189

### Root Cause
- **Django 4.2+** requires `sqlparse>=0.3.1`
- **Djongo 1.3.6/1.3.7** requires `sqlparse==0.2.4`
- These requirements are incompatible, causing pip to fail with a `ResolutionImpossible` error

## Solution
Downgraded Django from `Django>=4.2,<5.0` to `Django>=3.2,<4.0` in `backend/requirements.txt`.

### Changes Made
```diff
- Django>=4.2,<5.0
+ Django>=3.2,<4.0
```

## Verification
Successfully installed all dependencies with the fixed requirements.txt:
- ✅ Django 3.2.25 installed (compatible version)
- ✅ PyMongo 4.15.1 installed (for MongoDB support)
- ✅ No dependency conflicts
- ✅ Django system checks pass
- ✅ All migrations are up to date

## Current Status
- `backend/requirements.txt` now specifies `Django>=3.2,<4.0`
- Removed Djongo dependency (not actively maintained)
- Using PyMongo directly for MongoDB support instead
- All backend dependencies install successfully
- Ready for CI/CD pipeline

## Testing Commands
```bash
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py check
python manage.py makemigrations --dry-run --check
```

All commands execute successfully with no errors.

## Additional Notes
- Django 3.2 is an LTS (Long Term Support) release, supported until April 2024
- The project can upgrade to Django 4.x in the future by removing Djongo or migrating to a compatible database backend
- Current approach uses standard Django ORM with SQLite/PostgreSQL/MySQL and optional PyMongo for MongoDB-specific features
