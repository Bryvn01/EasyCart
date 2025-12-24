# Codecov Setup Guide for EasyCart

## Overview
This guide explains the complete Codecov setup for tracking test coverage in the EasyCart project.

## 🔧 Configuration Files

### 1. `codecov.yml` (Root)
**Purpose**: Main Codecov configuration
- Coverage targets: 60% (project and patch)
- Separate flags for backend and frontend
- Ignores test files, migrations, node_modules

### 2. `.coveragerc` (Root)
**Purpose**: Python/Django coverage configuration
- Source: `apps/` directory
- Omits migrations, tests, admin files
- XML output for Codecov
- Parallel test support

### 3. Workflow Integration
**Files**: `.github/workflows/reusable-test.yml`
- Backend: Uses `.coveragerc` for Django tests
- Frontend: Uses Jest built-in coverage (lcov.info)
- Uploads to Codecov with separate flags

## 🚀 Setup Steps

### Step 1: Add Codecov to Your Repository
1. Go to [codecov.io](https://codecov.io)
2. Sign in with GitHub
3. Add repository: `Bryvn01/EasyCart`
4. Get your **Upload Token**

### Step 2: Add GitHub Secret
1. Go to GitHub repository settings
2. Navigate to **Secrets and variables** → **Actions**
3. Add new repository secret:
   - Name: `CODECOV_TOKEN`
   - Value: `<your-upload-token-from-codecov>`

### Step 3: Verify Configuration Files
All configuration files are already in place:
- ✅ `codecov.yml` - Main Codecov config
- ✅ `.coveragerc` - Python coverage config
- ✅ `.github/workflows/reusable-test.yml` - Upload integration

### Step 4: Test the Setup
Trigger a workflow run:
```bash
git commit --allow-empty -m "test: trigger codecov upload"
git push
```

## 📊 Coverage Badges

### Current Badge in README.md
```markdown
[![codecov](https://codecov.io/gh/Bryvn01/EasyCart/branch/main/graph/badge.svg)](https://codecov.io/gh/Bryvn01/EasyCart)
```

### Alternative Badges
```markdown
<!-- Coverage percentage badge -->
[![codecov](https://codecov.io/gh/Bryvn01/EasyCart/branch/main/graph/badge.svg?token=YOUR_TOKEN)](https://codecov.io/gh/Bryvn01/EasyCart)

<!-- Sunburst graph badge -->
[![codecov](https://codecov.io/gh/Bryvn01/EasyCart/branch/main/graphs/sunburst.svg)](https://codecov.io/gh/Bryvn01/EasyCart)
```

## 🔍 How It Works

### Backend Coverage (Django)
1. Tests run with `coverage run` command
2. Uses `.coveragerc` configuration
3. Generates `backend/coverage.xml`
4. Uploaded with flag: `backend`
5. Tracks coverage for `apps/` directory

### Frontend Coverage (React)
1. Tests run with `npm test -- --coverage`
2. Jest generates `frontend/coverage/lcov.info`
3. Uploaded with flag: `frontend`
4. Tracks coverage for `frontend/src/`

### Coverage Flags
- `backend`: Python/Django code coverage
- `frontend`: React/JavaScript code coverage
- Both can be viewed separately in Codecov dashboard

## 📈 Codecov Dashboard

After setup, you can:
1. View coverage trends over time
2. See which files/functions lack coverage
3. Get PR comments with coverage diff
4. Track coverage by flag (backend/frontend)

### Dashboard URL
```
https://codecov.io/gh/Bryvn01/EasyCart
```

## 🎯 Coverage Targets

### Project Level
- **Target**: 60% overall coverage
- **Threshold**: ±2% change allowed
- **Action**: Error if target not met

### Patch Level (New Code)
- **Target**: 60% for new code
- **Threshold**: ±5% change allowed
- **Action**: Error if target not met

## 🔧 Troubleshooting

### Issue: Upload Token Not Found
**Solution**: Add `CODECOV_TOKEN` to GitHub secrets

### Issue: Coverage File Not Found
**Backend**: Check that `backend/coverage.xml` is generated
```bash
cd backend
coverage run --rcfile=../.coveragerc manage.py test
coverage xml --rcfile=../.coveragerc
```

**Frontend**: Check that `frontend/coverage/lcov.info` exists
```bash
cd frontend
npm test -- --coverage --watchAll=false
ls coverage/lcov.info
```

### Issue: Low Coverage Warning
**Expected**: Initial coverage may be low
**Action**: Gradually increase test coverage over time

### Issue: Badge Shows "Unknown"
**Cause**: First upload hasn't completed yet
**Solution**: Wait for workflow to complete, then refresh

## 📝 Best Practices

### 1. Write Tests for New Features
Always include tests with new code to maintain coverage

### 2. Review Coverage Reports
Check Codecov PR comments before merging

### 3. Ignore Appropriate Files
Already configured to ignore:
- Migrations
- Test files themselves
- Configuration files
- Node modules

### 4. Set Realistic Targets
Current target: 60% (reasonable for MVP)
Increase gradually as project matures

### 5. Use Coverage Locally
**Backend**:
```bash
cd backend
coverage run --rcfile=../.coveragerc manage.py test
coverage report
coverage html  # Open htmlcov/index.html
```

**Frontend**:
```bash
cd frontend
npm test -- --coverage --watchAll=false
# Open coverage/lcov-report/index.html
```

## 🎉 Success Indicators

✅ Codecov badge shows coverage percentage
✅ PR comments show coverage diff
✅ Dashboard displays coverage trends
✅ Separate backend/frontend coverage visible
✅ No upload errors in workflow logs

## 🔗 Resources

- [Codecov Documentation](https://docs.codecov.com/)
- [Coverage.py Docs](https://coverage.readthedocs.io/)
- [Jest Coverage](https://jestjs.io/docs/configuration#collectcoverage-boolean)
- [Codecov GitHub Action](https://github.com/codecov/codecov-action)

## 📞 Support

If you encounter issues:
1. Check workflow logs for upload errors
2. Verify `CODECOV_TOKEN` is set correctly
3. Ensure coverage files are generated
4. Review codecov.io dashboard for errors
5. Check [Codecov Support](https://community.codecov.com/)
