# Immediate Actions Required - Branch & PR Cleanup

## 🚨 Critical Issues Found

### Current State
- **Total remote branches**: 151
- **Estimated stale branches**: 140+
- **Active branches**: 2 (main, feat/mobile-demo-fixes)
- **Status**: CRITICAL - Immediate action required

---

## ⚡ Quick Win Actions (Do Now)

### 1. Enable Auto-Delete on Merge (5 minutes)
**GitHub Settings → General → Pull Requests**
- ✅ Check "Automatically delete head branches"

This prevents future branch accumulation.

### 2. Review Current PR (10 minutes)
**Branch**: `feat/mobile-demo-fixes`
- [ ] Verify CI passes
- [ ] Get code review
- [ ] Merge to main
- [ ] Branch will auto-delete

### 3. Quick Audit (15 minutes)
Run this PowerShell command:
```powershell
# Count copilot branches
(git branch -r | Select-String "copilot/fix").Count

# Count dependabot branches  
(git branch -r | Select-String "dependabot").Count

# List recent branches
git for-each-ref --sort=-committerdate refs/remotes/ --format='%(committerdate:short) %(refname:short)' --count=20
```

---

## 📋 Today's Checklist

### Morning (2 hours)
- [ ] **Enable auto-delete** on GitHub
- [ ] **Merge feat/mobile-demo-fixes** PR
- [ ] **Run audit** to identify safe-to-delete branches
- [ ] **Create backup** of branch list

### Afternoon (3 hours)
- [ ] **Delete 50 merged copilot branches** (batch 1)
- [ ] **Close 10 stale dependabot PRs**
- [ ] **Document** deleted branches

### End of Day
- [ ] **Verify** main branch is healthy
- [ ] **Update** team on cleanup progress
- [ ] **Schedule** tomorrow's cleanup

---

## 🎯 This Week's Goals

### Day 1 (Today)
- Enable auto-delete
- Delete 50 merged branches
- Close 10 stale PRs

### Day 2
- Delete remaining merged branches (90+)
- Review all open PRs

### Day 3
- Close all stale PRs (>60 days)
- Consolidate dependabot PRs

### Day 4
- Review copilot feature branches
- Merge or close each one

### Day 5
- Final cleanup
- Document process
- Set up automation

---

## 🛠️ Safe Deletion Process

### Step 1: Identify Merged Branches
```powershell
# PowerShell command
git branch -r --merged origin/main | Select-String -NotMatch "main|develop|HEAD" | Out-File reports\merged_branches.txt
```

### Step 2: Review List
Open `reports\merged_branches.txt` and verify:
- All branches are actually merged
- No important work will be lost
- No dependent branches exist

### Step 3: Delete in Batches
```powershell
# Delete one branch (test first)
git push origin --delete copilot/fix-XXXXX

# If successful, continue with batch
Get-Content reports\merged_branches.txt | ForEach-Object {
    $branch = $_.Trim() -replace 'origin/', ''
    if ($branch) {
        Write-Host "Deleting: $branch"
        git push origin --delete $branch
    }
}
```

### Step 4: Prune Local References
```bash
git remote prune origin
git fetch --prune
```

---

## 🚫 DO NOT Delete These

### Protected Branches
- `main` - Production
- `develop` - Integration (if exists)
- `feat/mobile-demo-fixes` - Current work

### Active Feature Branches
Check for:
- Recent commits (<7 days)
- Open PRs with activity
- Branches mentioned in issues

### Uncertain Branches
If unsure:
1. Check last commit: `git log origin/branch-name -1`
2. Check for unique commits: `git log origin/main..origin/branch-name`
3. Ask team member
4. Skip for now

---

## 📊 Success Metrics

### Target by End of Week
- Total branches: <20
- Stale branches: 0
- Open PRs: <5
- All PRs have activity <30 days

### Daily Progress Tracking
```
Day 1: 151 → 100 branches (-51)
Day 2: 100 → 50 branches (-50)
Day 3: 50 → 20 branches (-30)
Day 4: 20 → 15 branches (-5)
Day 5: 15 → 10 branches (-5)
```

---

## ⚠️ Risk Mitigation

### Before Any Deletion
1. **Backup branch list**: Save to file
2. **Check for unique commits**: Verify nothing important
3. **Notify team**: Send cleanup schedule
4. **Test with one branch**: Delete one, verify it's gone
5. **Have rollback plan**: Know how to restore if needed

### If Something Goes Wrong
```bash
# Restore deleted branch (if you have the commit SHA)
git push origin <commit-sha>:refs/heads/branch-name

# Or restore from GitHub (if recently deleted)
# GitHub keeps deleted branches for 30 days
```

---

## 📞 Need Help?

### Questions to Ask
1. "Is this branch merged to main?"
   - Check: `git branch -r --merged origin/main | grep branch-name`

2. "Does this branch have unique commits?"
   - Check: `git log origin/main..origin/branch-name`

3. "Is there an open PR for this branch?"
   - Check GitHub PR list

4. "When was the last commit?"
   - Check: `git log origin/branch-name -1 --format="%cd"`

### Escalation
- If unsure: Skip and mark for review
- If critical: Tag team lead
- If emergency: Stop and assess

---

## ✅ Completion Checklist

### Phase 1: Preparation
- [ ] Read this document
- [ ] Enable auto-delete on GitHub
- [ ] Create reports directory
- [ ] Backup current branch list
- [ ] Notify team of cleanup

### Phase 2: Execution
- [ ] Delete merged branches (batch 1)
- [ ] Delete merged branches (batch 2)
- [ ] Close stale PRs
- [ ] Consolidate dependabot PRs
- [ ] Review copilot branches

### Phase 3: Verification
- [ ] Verify main branch works
- [ ] Check CI/CD pipelines
- [ ] Confirm no broken links
- [ ] Update documentation

### Phase 4: Prevention
- [ ] Set up stale bot
- [ ] Configure dependabot auto-merge
- [ ] Document branch strategy
- [ ] Train team on process

---

## 📝 Daily Log Template

```markdown
## Cleanup Log - [Date]

### Branches Deleted
- copilot/fix-XXXXX (merged 2024-01-15)
- copilot/fix-YYYYY (merged 2024-01-20)
- ... (total: XX)

### PRs Closed
- #123 - Stale, no activity 90 days
- #124 - Superseded by #125
- ... (total: XX)

### Issues Encountered
- None / [describe issue]

### Next Steps
- [Tomorrow's plan]
```

---

## 🎉 Expected Outcome

### Before
- 151 branches
- Cluttered repository
- Difficult navigation
- High maintenance

### After
- <20 branches
- Clean repository
- Easy navigation
- Low maintenance
- Automated cleanup

**Time Investment**: 2-3 days  
**Long-term Benefit**: Ongoing clean repository

---

Start with the quick wins, then tackle the bulk cleanup systematically. You've got this! 💪
