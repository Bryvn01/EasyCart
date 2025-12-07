# Dependabot PR Management Guide

## Quick Actions

### Merge All Safe Updates
```bash
# Use GitHub CLI to merge all passing Dependabot PRs
gh pr list --author "app/dependabot" --json number,title,statusCheckRollup --jq '.[] | select(.statusCheckRollup[0].conclusion == "SUCCESS") | .number' | xargs -I {} gh pr merge {} --auto --squash
```

### Priority Order

**1. Critical Security (Merge Immediately)**
- CVE fixes
- Authentication/authorization vulnerabilities
- SQL injection, XSS, CSRF fixes

**2. High Priority (Merge Within 24h)**
- Django, DRF, React core updates
- Database driver updates (psycopg2)
- Authentication libraries (simplejwt)

**3. Medium Priority (Merge Weekly)**
- Utility libraries (requests, axios)
- UI libraries (react-icons, framer-motion)
- Development tools

**4. Low Priority (Review Monthly)**
- Documentation tools
- Linters, formatters
- Type definitions

## Batch Merge Strategy

### Week 1: Backend Critical
```bash
# Merge Django, DRF, security updates
gh pr list --label "dependencies" --label "python" --search "Django OR djangorestframework OR security"
```

### Week 2: Frontend Critical
```bash
# Merge React, security updates
gh pr list --label "dependencies" --label "javascript" --search "react OR security"
```

### Week 3: All Other Updates
```bash
# Merge remaining updates
gh pr list --label "dependencies" --state "open"
```

## Testing Checklist

Before merging Dependabot PRs:
- [ ] CI/CD passes (green checkmark)
- [ ] No breaking changes in changelog
- [ ] Test locally if major version bump
- [ ] Check for peer dependency conflicts

## Auto-Merge Configuration

Dependabot is configured to auto-merge:
- ✅ Patch updates (1.2.3 → 1.2.4)
- ✅ Minor updates (1.2.0 → 1.3.0) for dev dependencies
- ❌ Major updates (1.x → 2.x) - Manual review required

## Common Issues

### Merge Conflicts
```bash
# Rebase Dependabot PR
gh pr comment <PR_NUMBER> --body "@dependabot rebase"
```

### Failed CI
```bash
# Recreate PR
gh pr comment <PR_NUMBER> --body "@dependabot recreate"
```

### Close Unwanted PR
```bash
# Close and ignore version
gh pr comment <PR_NUMBER> --body "@dependabot ignore this major version"
```

## Monthly Maintenance

1. Review all open Dependabot PRs
2. Merge all passing PRs in batches
3. Close outdated/superseded PRs
4. Update this guide with new patterns
