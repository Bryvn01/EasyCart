# Security Configuration Examples

This document provides example snippets from the implemented security configurations for quick reference.

## 1. Dependabot Configuration Example

```yaml
# .github/dependabot.yml (excerpt)

version: 2

updates:
  # Frontend npm dependencies
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 5
    groups:
      npm-dependencies:
        patterns: ["*"]
        update-types: ["minor", "patch"]
      npm-major:
        patterns: ["*"]
        update-types: ["major"]
    labels:
      - "dependencies"
      - "frontend"
      - "npm"
    commit-message:
      prefix: "chore(deps)"
      include: "scope"
```

**Key Features:**
- ✅ Weekly schedule (Monday 09:00 UTC)
- ✅ Limited to 5 open PRs
- ✅ Groups minor/patch updates
- ✅ Separates major updates
- ✅ Auto-labels for filtering

## 2. CodeQL Workflow Example

```yaml
# .github/workflows/codeql-analysis.yml (excerpt)

name: "CodeQL Security Scan"

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 6 * * 1'  # Monday 06:00 UTC

jobs:
  analyze-python:
    name: Analyze Python (Django Backend)
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: python
          queries: security-extended
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

**Key Features:**
- ✅ Scans Python and JavaScript
- ✅ Security-extended queries
- ✅ Blocks High/Critical issues
- ✅ Weekly + on-demand scans
- ✅ SARIF reporting

## 3. Staging Deployment Workflow Example

```yaml
# .github/workflows/dependabot-staging.yml (excerpt)

name: "Dependabot Staging Deploy"

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  check-dependabot:
    name: Check if Dependabot PR
    runs-on: ubuntu-latest
    outputs:
      is-dependabot: ${{ steps.check.outputs.is-dependabot }}
    steps:
      - name: Check PR author
        id: check
        run: |
          if [[ "${{ github.event.pull_request.user.login }}" == "dependabot[bot]" ]]; then
            echo "is-dependabot=true" >> $GITHUB_OUTPUT
          else
            echo "is-dependabot=false" >> $GITHUB_OUTPUT
          fi

  deploy-to-staging:
    name: Deploy to Render Staging
    runs-on: ubuntu-latest
    needs: check-dependabot
    if: needs.check-dependabot.outputs.is-dependabot == 'true'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run Backend Tests
        run: |
          cd backend
          python manage.py test
      
      - name: Build Frontend
        run: |
          cd frontend
          npm ci
          npm run build
      
      - name: Trigger Render Deploy
        env:
          BACKEND_HOOK: ${{ secrets.RENDER_STAGING_BACKEND_HOOK }}
        run: |
          curl -X POST "$BACKEND_HOOK"
```

**Key Features:**
- ✅ Auto-detects Dependabot PRs
- ✅ Runs comprehensive tests
- ✅ Optional staging deployment
- ✅ Posts PR status comments
- ✅ Graceful fallback

## 4. Branch Protection Configuration

To enable CodeQL blocking in branch protection:

```yaml
# Settings → Branches → main (in GitHub UI)

Branch protection rules:
  ✓ Require pull request reviews before merging
  ✓ Require status checks to pass before merging
    Required checks:
      - CodeQL Security Summary
      - test-and-build (existing CI)
      - Deploy to Render Staging (optional)
  ✓ Require branches to be up to date before merging
  ✓ Require conversation resolution before merging
```

## 5. GitHub Secrets Configuration

For staging deployment, configure these secrets:

```bash
# Settings → Secrets and variables → Actions

# Required for staging deployment
RENDER_STAGING_BACKEND_HOOK=https://api.render.com/deploy/srv-xxx?key=xxx
RENDER_STAGING_FRONTEND_HOOK=https://api.render.com/deploy/srv-xxx?key=xxx
RENDER_STAGING_ADMIN_HOOK=https://api.render.com/deploy/srv-xxx?key=xxx

# Optional - defaults to production URLs if not set
STAGING_BACKEND_URL=https://easycart-backend-staging.onrender.com
STAGING_FRONTEND_URL=https://easycart-frontend-staging.onrender.com
```

## 6. Example Dependabot PR

When Dependabot creates a PR, it will look like:

```
Title: chore(deps): Bump django from 4.2.15 to 4.2.16 in /backend

Description:
Bumps django from 4.2.15 to 4.2.16.

Release notes:
- Security fix: CVE-2024-xxxxx
- Bug fix: Fixed middleware issue
- Performance: Improved query optimization

Labels:
  dependencies, backend, python

Automated Checks:
  ✅ CodeQL Security Summary
  ✅ Deploy to Render Staging
  ✅ test-and-build

Status Comment:
  ✅ Staging Deployment Success
  
  Test Results:
  - Backend Tests: ✅ Passed
  - Frontend Build: ✅ Passed
  - Frontend Tests: ✅ Passed
  
  Staging URLs:
  - Backend: https://easycart-backend-staging.onrender.com
  - Frontend: https://easycart-frontend-staging.onrender.com
```

## 7. Example CodeQL Alert

When CodeQL finds an issue:

```
Alert: SQL Injection vulnerability
Severity: High (8.5)
Location: backend/apps/orders/views.py:45
Status: Open

Description:
User input is used directly in SQL query without sanitization.

Path:
user_input → query → execute()

Recommendation:
Use parameterized queries or Django ORM instead:
  
  # Bad
  cursor.execute(f"SELECT * FROM orders WHERE id = {order_id}")
  
  # Good
  cursor.execute("SELECT * FROM orders WHERE id = %s", [order_id])
  
  # Better (Django ORM)
  Order.objects.get(id=order_id)
```

## 8. Monitoring Dashboard Examples

### Security Tab View
```
Code scanning alerts
  2 High severity
  5 Medium severity
  12 Low severity

Recent alerts:
  ❌ SQL Injection in orders/views.py (High)
  ❌ XSS in products/templates/detail.html (High)
  ⚠️ Insecure randomness in utils/generators.py (Medium)
```

### Dependabot Tab View
```
Open pull requests: 8
Merged last month: 24
Security advisories: 3

Recent updates:
  🔴 Django 4.2.15 → 4.2.16 (security)
  🟡 axios 1.6.0 → 1.6.2 (patch)
  🟢 react 18.2.0 → 18.2.1 (patch)
```

## 9. Useful GitHub CLI Commands

```bash
# View Dependabot PRs
gh pr list --author "dependabot[bot]" --state open

# View CodeQL workflow runs
gh run list --workflow=codeql-analysis.yml --limit 10

# View specific workflow run logs
gh run view RUN_ID --log

# Trigger manual CodeQL scan
gh workflow run codeql-analysis.yml

# View security alerts
gh api /repos/OWNER/REPO/code-scanning/alerts

# View Dependabot alerts
gh api /repos/OWNER/REPO/dependabot/alerts
```

## 10. Testing Commands

```bash
# Validate YAML syntax
python3 -c "import yaml; yaml.safe_load(open('.github/dependabot.yml'))"

# Check workflow syntax
gh workflow view codeql-analysis.yml

# Test backend locally
cd backend
python manage.py test

# Test frontend locally
cd frontend
npm test -- --watchAll=false

# Build frontend locally
npm run build
```

## 11. Maintenance Tasks

### Weekly
- [ ] Review open Dependabot PRs
- [ ] Check CodeQL scan results
- [ ] Review new security alerts
- [ ] Merge approved dependency updates

### Monthly
- [ ] Review Dependabot metrics
- [ ] Check false positive rate
- [ ] Update documentation
- [ ] Review staging deployment success rate

### Quarterly
- [ ] Update Dependabot configuration
- [ ] Review CodeQL query suite
- [ ] Assess security posture
- [ ] Update branch protection rules

## 12. Troubleshooting Examples

### Problem: Dependabot not creating PRs
```bash
# Check configuration syntax
python3 -c "import yaml; yaml.safe_load(open('.github/dependabot.yml'))"

# Check Dependabot settings in GitHub
# Settings → Code security and analysis → Dependabot

# Check if there are already 5 open PRs (limit reached)
gh pr list --author "dependabot[bot]" --state open
```

### Problem: CodeQL scan failing
```bash
# View workflow logs
gh run list --workflow=codeql-analysis.yml --limit 5
gh run view RUN_ID --log

# Check if dependencies install correctly
cd backend
pip install -r requirements.txt
```

### Problem: Staging deployment not working
```bash
# Check if secrets are set
# Settings → Secrets and variables → Actions

# Verify webhook URL works
curl -X POST $RENDER_STAGING_BACKEND_HOOK

# Check Render deployment logs
# https://dashboard.render.com → Select service → Logs
```

## 13. Success Metrics Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  Metric                    Current    Target    Status  │
├─────────────────────────────────────────────────────────┤
│  Mean Time to Update       4 days     <7 days   ✅      │
│  Open Vulnerabilities      2 High     0 High    ⚠️      │
│  Dependabot Merge Rate     94%        >90%      ✅      │
│  CodeQL False Positives    3%         <5%       ✅      │
│  Staging Success Rate      98%        >95%      ✅      │
└─────────────────────────────────────────────────────────┘
```

## 14. Integration with Existing CI/CD

```yaml
# These workflows work alongside existing:
# - ci.yml (existing CI)
# - render-ci.yml (existing Render CI)
# - deploy.yml (existing deployment)

# No conflicts, all workflows can run concurrently
# CodeQL adds security layer without replacing existing tests
```

## Related Documentation

- [SECURITY_HARDENING_GUIDE.md](SECURITY_HARDENING_GUIDE.md) - Complete guide
- [SECURITY_CONFIG_QUICKSTART.md](SECURITY_CONFIG_QUICKSTART.md) - Quick reference
- [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) - Visual diagrams
- [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) - Implementation summary

---

**Quick Start**: These examples show the key components of each configuration. For full details, see the complete files in `.github/` directory.
