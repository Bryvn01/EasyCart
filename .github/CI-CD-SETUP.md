# CI/CD Setup Guide

## Overview
This project uses GitHub Actions for continuous integration and deployment.

## Workflows

### 1. Required Checks (`required-checks.yml`)
- **Trigger**: Push to main/develop, PRs
- **Purpose**: Mandatory checks for merge
- **Jobs**:
  - Backend tests (Django)
  - Frontend tests (Jest)
  - Build verification

### 2. CI Pipeline (`ci.yml`)
- **Trigger**: Push to main/develop/feature branches
- **Purpose**: Comprehensive testing and security
- **Jobs**:
  - Linting (backend & frontend)
  - Security scanning (Bandit)
  - Unit tests
  - Coverage reports
  - Build artifacts

### 3. Status Check (`status-check.yml`)
- **Trigger**: Push/PR to main/develop
- **Purpose**: Quick status verification

## Required Secrets

Add these to GitHub repository settings:

```
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_CLOUD_NAME
```

## Local Testing

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py test
```

### Frontend
```bash
cd frontend
npm ci
npm test
npm run build
```

## Troubleshooting

### Tests Failing
- Ensure all dependencies are installed
- Check environment variables
- Run tests locally first

### Build Failing
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall
- Check for syntax errors

## Branch Protection Rules

Recommended settings for `main` branch:
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Required checks: `test-and-build`
- ✅ Require pull request reviews (1 approver)
