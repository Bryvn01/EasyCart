# 🚀 EasyCart DevOps Quick Reference

**Last Updated**: January 2025
**Status**: ✅ Production Ready | 📊 27% Coverage (→60%) | 🧹 Branch Cleanup Automated

---

## 📊 Current Project Status

```
✅ Tests:        153/153 passing (100% pass rate)
📊 Coverage:     27% (Target: 60% in 3 weeks)
🌳 Branches:     84 total (cleanup in progress)
🔐 Security:     40 vulnerabilities identified
🚀 CI/CD:        Stable and automated
📚 Documentation: Enterprise-grade
```

---

## 🎯 Quick Commands

### Run Tests
```bash
# Backend (with coverage)
cd backend
coverage run --source='apps' manage.py test --parallel=2
coverage report

# Frontend
cd frontend
npm test
```

### Branch Cleanup
```bash
# Automated (already set up - runs Sundays)
# View workflow: .github/workflows/branch-cleanup-auto.yml

# Manual cleanup script
.\scripts\cleanup-branches.ps1 -DryRun -DeleteMerged
.\scripts\cleanup-branches.ps1 -DeleteMerged
.\scripts\cleanup-branches.ps1 -DeleteStale -StaleDays 60
.\scripts\cleanup-branches.ps1 -DeleteDependabot
```

### Check CI/CD Status
```bash
# View GitHub Actions
https://github.com/Bryvn01/EasyCart/actions

# Check coverage
https://codecov.io/gh/Bryvn01/EasyCart

# Security alerts
https://github.com/Bryvn01/EasyCart/security/dependabot
```

---

## 📅 3-Week Roadmap (At a Glance)

### ✅ Week 0: Foundation (COMPLETED)
- [x] Automated branch cleanup workflow
- [x] Coverage threshold enforcement (25%)
- [x] Professional README with metrics
- [x] Comprehensive DevOps improvement plan
- [x] Branch cleanup PowerShell script

### ⏳ Week 1: Critical Path (STARTING)
**Focus**: Test Coverage + Documentation
- [ ] Write 20+ critical path tests (payment/orders/OTP)
- [ ] Increase coverage: 27% → 40%
- [ ] Create CONTRIBUTING.md
- [ ] Manual branch cleanup (first pass)
- [ ] Configure branch protection rules

**Commands**:
```bash
# Write tests in
backend/apps/orders/tests/test_payment_service.py
backend/apps/accounts/tests/test_otp_service.py

# Update coverage threshold in
.github/workflows/reusable-test.yml (line 150: THRESHOLD=40)
```

### ⏳ Week 2: Security & Middleware
**Focus**: Security Hardening + Middleware Testing
- [ ] Write 15+ security/middleware tests
- [ ] Increase coverage: 40% → 50%
- [ ] Implement security scanning workflow
- [ ] Review and merge Dependabot PRs (40 vulnerabilities)
- [ ] Create docs/ARCHITECTURE.md

### ⏳ Week 3: POS System & Finalization
**Focus**: POS Coverage + Final Polish
- [ ] Write 30+ POS system tests
- [ ] Increase coverage: 50% → 60%
- [ ] Performance benchmarking workflow
- [ ] Final branch cleanup (<10 branches)
- [ ] Project health report

---

## 🔧 Common Tasks

### 1. Update Coverage Threshold
**File**: `.github/workflows/reusable-test.yml` (line ~150)
```yaml
THRESHOLD=25  # Change to 40, then 50, then 60
```

### 2. Manual Branch Deletion
```bash
# Delete specific branch
git push origin --delete branch-name

# Delete multiple merged branches
git branch -r --merged origin/main | grep "copilot/fix-" | sed 's|origin/||' | xargs -I {} git push origin --delete {}
```

### 3. Check Test Coverage Locally
```bash
cd backend
coverage run --source='apps' manage.py test --parallel=2
coverage report
coverage html  # Generate HTML report in htmlcov/
```

### 4. Run Pre-commit Hooks Manually
```bash
pre-commit run --all-files
```

### 5. View CI/CD Logs
```bash
# GitHub Actions dashboard
https://github.com/Bryvn01/EasyCart/actions

# Recent workflow runs
git log --oneline -5
```

---

## 📋 Weekly Maintenance Checklist

### Monday Morning (Start of Week)
- [ ] Check GitHub Actions dashboard for failures
- [ ] Review CodeCov coverage trends
- [ ] Check for new Dependabot PRs

### Wednesday (Mid-Week)
- [ ] Review any test failures
- [ ] Check CI/CD pipeline health
- [ ] Monitor coverage progress

### Friday (End of Week)
- [ ] Review weekly goals progress
- [ ] Merge approved Dependabot PRs
- [ ] Plan next week's tasks

### Sunday (Automated)
- Automated branch cleanup runs at midnight UTC
- Review cleanup summary on Monday

---

## 🎯 Coverage Targets by Module

```
Module                           Current  Week1  Week2  Week3
-----------------------------------------------------------------
apps/orders/payment_service.py    35%     65%    75%    80%
apps/accounts/otp_service.py       45%     65%    75%    80%
apps/support/security.py           15%     20%    60%    80%
apps/core/middleware.py            40%     45%    70%    80%
apps/pos/ (ALL)                     0%      5%    10%    60%
-----------------------------------------------------------------
TOTAL                              27%     40%    50%    60%
```

---

## 🔗 Important Links

### Documentation
- [DEVOPS_IMPROVEMENT_PLAN.md](DEVOPS_IMPROVEMENT_PLAN.md) - Full 3-week roadmap
- [DEVOPS_IMPLEMENTATION_SUMMARY.md](DEVOPS_IMPLEMENTATION_SUMMARY.md) - Current status
- [README.md](README.md) - Project overview with metrics
- [BRANCH_CLEANUP_STRATEGY.md](BRANCH_CLEANUP_STRATEGY.md) - Branch management

### Workflows
- [CI/CD Pipeline](.github/workflows/ci.yml)
- [Required Checks](.github/workflows/required-checks.yml)
- [Reusable Test Workflow](.github/workflows/reusable-test.yml) ← Coverage gate here
- [Branch Cleanup](.github/workflows/branch-cleanup-auto.yml) ← Automated cleanup

### External
- [GitHub Actions](https://github.com/Bryvn01/EasyCart/actions)
- [CodeCov Dashboard](https://codecov.io/gh/Bryvn01/EasyCart)
- [Dependabot Alerts](https://github.com/Bryvn01/EasyCart/security/dependabot)
- [Live Frontend](https://easycart-frontend-wj9x.onrender.com/)
- [Live API](https://easycart-backend-2k8l.onrender.com/api/)

---

## 🆘 Troubleshooting

### CI Failing: Coverage Below Threshold
```bash
# Check current coverage
cd backend
coverage run --source='apps' manage.py test --parallel=2
coverage report

# If below threshold, write more tests
# Then update threshold in .github/workflows/reusable-test.yml
```

### Branch Cleanup Not Running
```bash
# Check workflow status
https://github.com/Bryvn01/EasyCart/actions/workflows/branch-cleanup-auto.yml

# Manual trigger
# Go to Actions → Automated Branch Cleanup → Run workflow

# Or use PowerShell script
.\scripts\cleanup-branches.ps1 -DeleteMerged
```

### Pre-commit Hooks Failing
```bash
# Update hooks
pre-commit autoupdate

# Run manually to see errors
pre-commit run --all-files

# Skip if needed (not recommended)
git commit --no-verify
```

### Test Database Issues
```bash
# Drop stale test database (PostgreSQL)
psql -U postgres -c "DROP DATABASE IF EXISTS test_easycart;"

# Or in Python
python manage.py test --noinput

# If auth fails, check .env
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
```

---

## 💡 Pro Tips

1. **Write Tests First**: Before writing code, write the test. It's faster.
2. **Use Coverage HTML**: `coverage html` generates clickable reports.
3. **Batch Branch Deletions**: Delete 15-20 branches at a time to avoid overwhelming Git.
4. **Monitor CodeCov**: Set up Slack/email notifications for coverage drops.
5. **Automate Everything**: If you do it twice, automate it.

---

## 📞 Need Help?

### Key Files to Reference
- Coverage enforcement: `.github/workflows/reusable-test.yml`
- Branch cleanup: `.github/workflows/branch-cleanup-auto.yml`
- Test configuration: `backend/.coveragerc`
- Django settings: `backend/config/settings/`

### Common Issues
- **CI failing**: Check GitHub Actions logs
- **Coverage too low**: Write tests for critical modules first
- **Branch pollution**: Run automated cleanup or manual script
- **Security alerts**: Review Dependabot PRs weekly

---

**Remember**: The goal is 60% coverage and <10 branches within 3 weeks. You've got this! 🚀

**Current Phase**: ✅ Foundation Complete → Starting Week 1

---

**Quick Status Check**:
```bash
# Run this command to see everything
git log --oneline -3
git branch -r | wc -l  # Branch count
cd backend && coverage report  # Coverage status
```
