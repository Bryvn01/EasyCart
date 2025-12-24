# Repository Maintenance Guide

## Weekly Maintenance Checklist

### Monday: Security Audit
```bash
# Run automated security audit
cd frontend && npm audit
cd backend && pip-audit

# Review GitHub Security tab
# https://github.com/Bryvn01/EasyCart/security
```

### Tuesday: Dependabot PRs
```bash
# Run merge script
bash scripts/merge-dependabot.sh

# Or manual review
gh pr list --author "app/dependabot"
```

### Wednesday: Issue Triage
```bash
# Run triage script
bash scripts/triage-issues.sh

# Categorize new issues
# Close stale issues (>90 days)
```

### Thursday: Code Review
```bash
# Review open PRs
gh pr list --state open

# Merge approved PRs
gh pr merge <number> --squash
```

### Friday: Documentation
```bash
# Update CHANGELOG.md
# Update README.md if needed
# Review and update documentation
```

## Monthly Maintenance

### First Week: Major Updates
- Review major version updates from Dependabot
- Test in staging environment
- Update production dependencies

### Second Week: Performance Audit
- Run Lighthouse audit on frontend
- Check backend API response times
- Optimize slow queries

### Third Week: Security Deep Dive
- Review all security advisories
- Update security documentation
- Rotate credentials if needed

### Fourth Week: Cleanup
- Archive old branches
- Close completed milestones
- Update project roadmap

## Automated Workflows

### Security Audit (Weekly)
- **Trigger**: Every Monday at midnight
- **Action**: Runs npm audit and pip-audit
- **Output**: Security reports in GitHub Actions artifacts

### Dependabot Auto-Merge
- **Trigger**: On Dependabot PR creation
- **Action**: Auto-merges patch updates and dev dependencies
- **Requires**: CI/CD passing

### CI/CD Pipeline
- **Trigger**: On every push and PR
- **Action**: Runs tests, linting, security checks
- **Blocks**: Merge if tests fail

## Priority Labels

Use these labels for issue triage:

| Label | Description | SLA |
|-------|-------------|-----|
| `priority: critical` 🔴 | Production down | 4 hours |
| `priority: high` 🟠 | Major feature broken | 24 hours |
| `priority: medium` 🟡 | Feature partially broken | 1 week |
| `priority: low` 🟢 | Minor issue | 1 month |

## Type Labels

| Label | Description |
|-------|-------------|
| `type: bug` 🐛 | Something isn't working |
| `type: security` 🔒 | Security vulnerability |
| `type: enhancement` ✨ | New feature request |
| `type: documentation` 📝 | Documentation update |
| `wontfix` ❌ | Will not be fixed |

## Scripts

### Merge Dependabot PRs
```bash
bash scripts/merge-dependabot.sh
```

### Triage Issues
```bash
bash scripts/triage-issues.sh
```

### Run Security Audit
```bash
# Frontend
cd frontend && npm audit --audit-level=moderate

# Backend
cd backend && pip-audit
```

## Emergency Procedures

### Critical Security Vulnerability
1. Create hotfix branch: `git checkout -b hotfix/security-fix`
2. Apply fix and test
3. Create PR with `priority: critical` label
4. Merge immediately after review
5. Deploy to production
6. Notify users if data breach

### Production Outage
1. Check status: https://easycart-backend-2k8l.onrender.com/api/health/
2. Review logs in Render dashboard
3. Rollback if needed: Revert last deployment
4. Create incident report
5. Post-mortem within 24 hours

## Best Practices

### Before Merging PRs
- [ ] CI/CD passes (green checkmark)
- [ ] Code reviewed by at least 1 person
- [ ] Tests added for new features
- [ ] Documentation updated
- [ ] No merge conflicts

### Before Deploying
- [ ] All tests passing
- [ ] Security audit clean
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Rollback plan ready

### After Deploying
- [ ] Verify deployment: Check /api/health/
- [ ] Monitor logs for errors
- [ ] Test critical user flows
- [ ] Update CHANGELOG.md
- [ ] Notify team

## Useful Commands

### GitHub CLI
```bash
# List open issues
gh issue list --state open

# List open PRs
gh pr list --state open

# Merge PR
gh pr merge <number> --squash

# Close issue
gh issue close <number>

# Add label
gh issue edit <number> --add-label "priority: high"
```

### Git
```bash
# Update from main
git pull origin main

# Create feature branch
git checkout -b feature/new-feature

# Commit with conventional commits
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

## Support

- **Documentation**: See README.md and SECURITY.md
- **Issues**: https://github.com/Bryvn01/EasyCart/issues
- **Security**: https://github.com/Bryvn01/EasyCart/security
