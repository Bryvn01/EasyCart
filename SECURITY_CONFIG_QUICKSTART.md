# Security Configuration Quick Reference

## 📋 Quick Links

- **Full Documentation**: [SECURITY_HARDENING_GUIDE.md](SECURITY_HARDENING_GUIDE.md)
- **Dependabot Config**: [.github/dependabot.yml](.github/dependabot.yml)
- **CodeQL Workflow**: [.github/workflows/codeql-analysis.yml](.github/workflows/codeql-analysis.yml)
- **Staging Deploy**: [.github/workflows/dependabot-staging.yml](.github/workflows/dependabot-staging.yml)

## 🔧 Configurations Implemented

### 1. Dependabot (`.github/dependabot.yml`)
- ✅ Monitors 4 ecosystems: npm (frontend, backend, admin) + pip (backend)
- ✅ Weekly updates every Monday at 09:00 UTC
- ✅ Max 5 open PRs per ecosystem
- ✅ Groups minor/patch updates, separates major updates
- ✅ Auto-labels PRs for easy filtering

### 2. CodeQL Security Scanning (`.github/workflows/codeql-analysis.yml`)
- ✅ Scans Python (Django) and JavaScript (React)
- ✅ Uses security-extended query suite
- ✅ **Blocks merges on High/Critical findings**
- ✅ Runs on push, PR, and weekly schedule
- ✅ Integrates with branch protection

### 3. Dependabot Staging Deploy (`.github/workflows/dependabot-staging.yml`)
- ✅ Auto-detects Dependabot PRs
- ✅ Runs full test suite (unit + build)
- ✅ Optional: Deploys to Render staging
- ✅ Optional: Runs integration tests
- ✅ Posts status comments on PRs

## 🚀 Quick Setup

### Step 1: Enable Dependabot (Automatic)
No action needed! Dependabot will start creating PRs every Monday.

### Step 2: Enable CodeQL Branch Protection
1. Go to **Settings** → **Branches** → **main**
2. Enable "Require status checks to pass before merging"
3. Add "CodeQL Security Summary" to required checks
4. Save changes

### Step 3: (Optional) Configure Staging Deployment
Only if you want automated staging deployments:

1. Create staging services on Render
2. Get deploy hook URLs from Render
3. Add secrets to GitHub:
   - `RENDER_STAGING_BACKEND_HOOK`
   - `RENDER_STAGING_FRONTEND_HOOK`
   - `RENDER_STAGING_ADMIN_HOOK`
   - `STAGING_BACKEND_URL`
   - `STAGING_FRONTEND_URL`

## 📊 What Gets Scanned

| Component | Dependabot | CodeQL | Staging Tests |
|-----------|-----------|--------|---------------|
| Backend (Django) | ✅ pip | ✅ Python | ✅ Unit tests |
| Backend (Node.js) | ✅ npm | ✅ JavaScript | ✅ Unit tests |
| Frontend (React) | ✅ npm | ✅ JavaScript | ✅ Unit + Build |
| Admin (React) | ✅ npm | ✅ JavaScript | ✅ Build |

## 🔒 Security Issues Addressed

- ✅ Django SQL injection
- ✅ Gunicorn request smuggling
- ✅ Multer DoS
- ✅ Axios DoS
- ✅ nth-check regex complexity
- ✅ webpack-dev-server vulnerabilities
- ✅ PostCSS vulnerabilities
- ✅ braces vulnerabilities
- ✅ And many more...

## 🎯 Severity Levels

| Severity | CodeQL Action | Dependabot Priority |
|----------|--------------|---------------------|
| Critical (9.0+) | ❌ Block merge | 🔴 Fix immediately |
| High (7.0-8.9) | ❌ Block merge | 🟠 Fix within 1 week |
| Medium (4.0-6.9) | ⚠️ Report | 🟡 Fix within 1 month |
| Low (0.0-3.9) | ℹ️ Report | 🟢 Fix when convenient |

## 📅 Automated Schedule

```
Monday 06:00 UTC → CodeQL weekly scan
        ↓
Monday 09:00 UTC → Dependabot checks for updates
        ↓
On PR creation → Dependabot staging deployment
        ↓
On push/PR → CodeQL security scan
```

## 🏷️ PR Labels

Dependabot automatically adds these labels:

- `dependencies` - All dependency updates
- `frontend` - Frontend changes
- `backend` - Backend changes
- `admin-dashboard` - Admin dashboard changes
- `npm` - npm package updates
- `python` - Python package updates

## ✅ Checklist for Dependabot PRs

Before merging a Dependabot PR:

- [ ] Review the changelog/release notes
- [ ] Check for breaking changes
- [ ] Verify all CI checks pass
- [ ] Review CodeQL findings (if any)
- [ ] Check staging deployment (if configured)
- [ ] Test manually if it's a major update
- [ ] Approve and merge

## 🛑 When CodeQL Blocks a Merge

1. Check the "Security" tab for details
2. Click on the alert to see the vulnerability
3. Review the code path and suggested fix
4. Apply the fix in a new commit
5. Push and wait for re-scan
6. Merge once resolved

## 💡 Pro Tips

### Reducing PR Noise
- Group updates are already configured
- Adjust `open-pull-requests-limit` if needed
- Use labels to filter Dependabot PRs

### Faster Reviews
- Enable auto-merge for low-risk updates (with caution)
- Batch review similar updates
- Use GitHub's "Files changed" filter

### Security Monitoring
- Check **Security** → **Code scanning alerts** weekly
- Review **Insights** → **Dependency graph** → **Dependabot** monthly
- Monitor workflow runs for failures

## 🔗 Useful Commands

### Check Dependabot Status
```bash
# View open Dependabot PRs
gh pr list --author "dependabot[bot]" --state open

# View recent Dependabot PRs
gh pr list --author "dependabot[bot]" --limit 10
```

### Check CodeQL Results
```bash
# View recent workflow runs
gh run list --workflow=codeql-analysis.yml --limit 10

# View logs for specific run
gh run view [RUN_ID] --log
```

### Trigger Manual Scans
```bash
# Trigger CodeQL scan
gh workflow run codeql-analysis.yml

# Check workflow status
gh run watch
```

## 📞 Getting Help

**Issue Type** | **Where to Look**
---|---
Dependabot not creating PRs | Check `.github/dependabot.yml` syntax
CodeQL scan failing | Review workflow logs in Actions tab
Staging deployment issues | Check Render dashboard and secrets
False positive alerts | Review alert in Security tab, consider suppressing

## 🎓 Learn More

- **Dependabot**: https://docs.github.com/en/code-security/dependabot
- **CodeQL**: https://codeql.github.com/docs/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Full Guide**: [SECURITY_HARDENING_GUIDE.md](SECURITY_HARDENING_GUIDE.md)

---

**Quick Start**: Just commit these files and you're done! Dependabot and CodeQL will start working automatically. Branch protection and staging deployment are optional but recommended.
