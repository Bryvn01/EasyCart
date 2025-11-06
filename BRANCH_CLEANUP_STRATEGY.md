# Branch & PR Cleanup Strategy

## 🔍 Current State Analysis

### Branch Inventory
- **Active branches**: 2 (main, feat/mobile-demo-fixes)
- **Stale branches**: 100+ remote branches
  - 90+ `copilot/fix-*` branches (automated fixes)
  - 20+ `dependabot/*` branches (dependency updates)
  - 3 `copilot/` feature branches

### Issues Identified
1. **Branch Pollution**: 100+ unmerged/undeleted branches
2. **Unclear PR Status**: No visibility on which PRs are open/merged/abandoned
3. **Maintenance Overhead**: Difficult to navigate repository
4. **CI/CD Noise**: Multiple branches triggering builds

---

## 📋 Industry Standard Diagnosis

### Step 1: Audit Open PRs
```bash
# Check GitHub for open PRs
gh pr list --state open --limit 100

# Check merged but not deleted branches
gh pr list --state merged --limit 100
```

### Step 2: Categorize Branches

#### A. Safe to Delete (Merged PRs)
- Branches where PR was merged to main
- Verify: `git branch -r --merged origin/main`

#### B. Abandoned (No Activity >30 days)
- No commits in last 30 days
- No open PR or PR closed without merge

#### C. Active (Keep)
- Open PRs with recent activity
- Current feature branches
- Protected branches (main, develop)

#### D. Dependabot (Special Handling)
- Auto-merge if tests pass
- Close if superseded by newer version
- Delete after merge

---

## 🧹 Cleanup Actions

### Priority 1: Delete Merged Branches (Immediate)
```bash
# List merged branches
git branch -r --merged origin/main | grep -v "main\|develop" > merged_branches.txt

# Delete merged remote branches (after verification)
git push origin --delete copilot/fix-XXXXX
```

### Priority 2: Close Stale PRs (Within 24h)
**Criteria**: No activity >60 days, no response to comments

**Action**:
1. Comment: "Closing due to inactivity. Please reopen if still relevant."
2. Close PR
3. Delete branch

### Priority 3: Consolidate Dependabot PRs (Within 48h)
**Strategy**:
- Group by package (e.g., all react updates)
- Keep only latest version PR
- Close older PRs with comment: "Superseded by #XXX"

### Priority 4: Review Copilot Fix Branches (Within 72h)
**For each branch**:
1. Check if fix is still needed
2. If merged elsewhere, delete
3. If abandoned, close and delete
4. If valid, create proper PR with description

---

## 🤖 Automated Cleanup Script

### Script 1: Delete Merged Branches
```bash
#!/bin/bash
# delete_merged_branches.sh

# Get all merged branches except main/develop
MERGED=$(git branch -r --merged origin/main | \
  grep -v "main\|develop\|HEAD" | \
  sed 's/origin\///')

echo "Found $(echo "$MERGED" | wc -l) merged branches"
echo "$MERGED" > merged_branches_to_delete.txt

# Uncomment to delete (DANGEROUS - review list first!)
# for branch in $MERGED; do
#   git push origin --delete "$branch"
# done
```

### Script 2: Find Stale Branches
```bash
#!/bin/bash
# find_stale_branches.sh

# Branches with no commits in last 60 days
git for-each-ref --sort=-committerdate refs/remotes/ \
  --format='%(committerdate:short) %(refname:short)' | \
  awk -v date="$(date -d '60 days ago' +%Y-%m-%d)" '$1 < date {print $2}'
```

---

## 📊 Recommended Branch Strategy

### Branch Naming Convention
```
main                    # Production
develop                 # Integration
feature/TICKET-desc     # New features
fix/TICKET-desc         # Bug fixes
hotfix/TICKET-desc      # Production fixes
release/v1.2.3          # Release branches
```

### Branch Lifecycle
1. **Create**: From main or develop
2. **Develop**: Regular commits
3. **PR**: When ready for review
4. **Merge**: Squash or merge commit
5. **Delete**: Immediately after merge

### Protection Rules
```yaml
main:
  - Require PR reviews (2)
  - Require status checks
  - No direct pushes
  - Delete branch after merge

develop:
  - Require PR reviews (1)
  - Require status checks
  - Delete branch after merge
```

---

## 🎯 Action Plan (Next 7 Days)

### Day 1: Assessment
- [ ] Run audit scripts
- [ ] List all open PRs
- [ ] Categorize branches
- [ ] Create cleanup spreadsheet

### Day 2-3: Merged Branches
- [ ] Verify merged branches list
- [ ] Delete merged branches (batch 1: 50 branches)
- [ ] Delete merged branches (batch 2: remaining)

### Day 4-5: Stale PRs
- [ ] Review stale PRs (>60 days)
- [ ] Comment on stale PRs
- [ ] Close and delete after 24h grace period

### Day 6: Dependabot
- [ ] Review all dependabot PRs
- [ ] Merge or close each one
- [ ] Configure auto-merge for future

### Day 7: Documentation
- [ ] Update CONTRIBUTING.md with branch strategy
- [ ] Document cleanup process
- [ ] Set up branch protection rules

---

## 🛡️ Prevention Measures

### 1. GitHub Settings
```yaml
# .github/settings.yml
branches:
  - name: main
    protection:
      required_pull_request_reviews:
        required_approving_review_count: 2
      required_status_checks:
        strict: true
        contexts:
          - CI-CD-Pipeline / build-test-lint
      enforce_admins: false
      restrictions: null

# Auto-delete branches after merge
repository:
  delete_branch_on_merge: true
```

### 2. Dependabot Auto-Merge
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    reviewers:
      - "Bryvn01"
    labels:
      - "dependencies"
      - "automerge"
```

### 3. Stale Bot
```yaml
# .github/workflows/stale.yml
name: Close Stale Issues and PRs
on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/stale@v9
        with:
          stale-pr-message: 'This PR has been inactive for 60 days and will be closed in 7 days.'
          close-pr-message: 'Closing due to inactivity.'
          days-before-stale: 60
          days-before-close: 7
          stale-pr-label: 'stale'
```

---

## 📈 Success Metrics

### Before Cleanup
- Total branches: 120+
- Open PRs: Unknown
- Stale branches: 100+
- Maintenance time: High

### After Cleanup (Target)
- Total branches: <10
- Open PRs: <5 active
- Stale branches: 0
- Maintenance time: Low

### Ongoing (Monthly)
- New branches created: <20
- Branches deleted: >15
- Average branch lifetime: <14 days
- Stale branches: 0

---

## 🚨 Safety Checklist

Before deleting any branch:
- [ ] Verify branch is merged to main
- [ ] Check no open PR references it
- [ ] Confirm no dependent branches
- [ ] Review last commit date
- [ ] Check for unique commits not in main
- [ ] Backup branch list to file

---

## 📞 Escalation Path

If unsure about a branch:
1. Check commit history: `git log origin/branch-name`
2. Check PR status: `gh pr view branch-name`
3. Ask in team chat
4. Tag branch for manual review
5. Don't delete - mark as "needs-review"

---

## 🔗 Useful Commands

```bash
# List all remote branches
git branch -r

# List merged branches
git branch -r --merged origin/main

# List unmerged branches
git branch -r --no-merged origin/main

# Delete remote branch
git push origin --delete branch-name

# Delete multiple branches
git branch -r --merged origin/main | grep "copilot/fix" | sed 's/origin\///' | xargs -I {} git push origin --delete {}

# Prune deleted remote branches locally
git remote prune origin

# Show branch last commit date
git for-each-ref --sort=-committerdate refs/remotes/ --format='%(committerdate:short) %(refname:short)'
```

---

## 📝 Next Steps

1. **Review this document** with team
2. **Run audit scripts** to get current state
3. **Create GitHub issue** for tracking cleanup
4. **Schedule cleanup** in sprint planning
5. **Implement prevention** measures
6. **Monitor metrics** monthly

---

## ✅ Approval Required

- [ ] Team Lead approval
- [ ] Review branch list
- [ ] Confirm no critical branches in delete list
- [ ] Schedule maintenance window
- [ ] Notify team of cleanup

**Approved by**: _______________
**Date**: _______________
