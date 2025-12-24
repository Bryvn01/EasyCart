# Branch Management Best Practices

## 🌳 Current Situation
- **Total Branches**: 94+ (including remotes)
- **Issue**: Too many branches creates confusion and clutter
- **Risk**: Outdated branches, merge conflicts, unclear active work

## ✅ Implemented Solutions

### 1. **Auto-Delete Merged Branches**
**Workflow**: [.github/workflows/branch-cleanup.yml](.github/workflows/branch-cleanup.yml)

**Features**:
- ✅ Automatically deletes PR branches after merge
- ✅ Manual cleanup with dry-run mode
- ✅ Protects main and develop branches
- ✅ Shows summary of what will be deleted

**How to Use**:
```bash
# Via GitHub UI:
1. Go to Actions tab
2. Select "Auto-Delete Merged Branches" workflow
3. Click "Run workflow"
4. Choose dry_run: true (to preview) or false (to delete)
5. Click "Run workflow"
```

**Automatic Mode**:
- Runs automatically when PRs are merged
- Deletes the source branch immediately
- No manual action needed

### 2. **Branch Naming Convention**

**Protected Branches** (Never Delete):
- `main` - Production code
- `develop` - Development integration branch

**Feature Branches** (Delete After Merge):
```
feature/short-description
feature/ISSUE-123-description
bugfix/issue-description
hotfix/critical-fix
```

**Examples**:
```bash
✅ Good: feature/user-authentication
✅ Good: bugfix/cart-calculation
✅ Good: hotfix/security-patch
❌ Bad: test
❌ Bad: my-branch
❌ Bad: bryan-working-copy
```

### 3. **Branch Lifecycle Best Practices**

#### Creating Branches
```bash
# Always branch from latest main
git checkout main
git pull origin main
git checkout -b feature/my-feature

# Or from develop for team workflows
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
```

#### Working on Branches
```bash
# Commit regularly with clear messages
git add .
git commit -m "feat: Add user profile page"

# Push to remote
git push origin feature/my-feature
```

#### After Merging
```bash
# Delete local branch
git branch -d feature/my-feature

# Delete remote branch (if not auto-deleted)
git push origin --delete feature/my-feature

# Clean up local tracking references
git fetch --prune
```

### 4. **Cleanup Commands**

#### Manual Local Cleanup
```bash
# Delete all local branches merged to main
git branch --merged main | grep -v "main\|develop\|*" | xargs git branch -d

# PowerShell version
git branch --merged main | Where-Object { $_ -notmatch '\*' -and $_ -notmatch 'main' -and $_ -notmatch 'develop' } | ForEach-Object { git branch -d $_.Trim() }

# Prune remote tracking branches that no longer exist
git fetch --prune

# View what would be deleted without deleting
git branch --merged main | grep -v "main\|develop\|*"
```

#### Manual Remote Cleanup
```bash
# List remote branches merged to main
git branch -r --merged origin/main

# Delete specific remote branch
git push origin --delete feature/old-branch

# Bulk delete (BE CAREFUL!)
git branch -r --merged origin/main | grep -v "main\|develop\|HEAD" | sed 's/origin\///' | xargs -I {} git push origin --delete {}
```

### 5. **Branch Protection Rules**

**Recommended Settings** (GitHub Settings → Branches):

**For `main` branch**:
- ✅ Require pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass
  - CI-CD-Pipeline
  - Required Status Checks
- ✅ Require branches to be up to date
- ✅ Require conversation resolution
- ✅ Do not allow bypassing (remove if solo developer)

**For `develop` branch**:
- ✅ Require pull request before merging
- ✅ Require status checks to pass
- ⚠️ Allow force pushes (for rebasing)

## 📊 Branch Health Monitoring

### Quick Health Check
```bash
# Count total branches
git branch -a | wc -l

# Count merged branches
git branch --merged main | wc -l

# Count unmerged branches
git branch --no-merged main | wc -l

# View branches by last commit date
git for-each-ref --sort=-committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)'
```

### Identify Stale Branches
```bash
# Branches not updated in 30 days
git for-each-ref --sort=-committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)' | grep "2024-11"

# Find branches by author
git for-each-ref --format='%(authorname) %(refname:short)' refs/heads/
```

## 🎯 Cleanup Strategy

### Immediate Actions
1. ✅ **Enable Auto-Delete Workflow** - Already implemented
2. ✅ **Run Manual Cleanup**:
   ```bash
   # Via GitHub Actions
   Actions → Auto-Delete Merged Branches → Run workflow → dry_run: true
   ```

3. ✅ **Review and Delete Manually**:
   - Check branches older than 30 days
   - Verify they're merged
   - Delete if no longer needed

### Ongoing Maintenance

**Weekly**:
- Review active branches
- Delete personal test branches
- Clean up old feature branches

**After Each PR Merge**:
- Verify branch auto-deleted
- Clean up local copy
- Run `git fetch --prune`

**Monthly**:
- Run branch health check
- Review branch protection rules
- Update branch naming conventions if needed

## 🛠️ Tools and Scripts

### PowerShell Script: Local Cleanup
```powershell
# Save as: cleanup-branches.ps1
param(
    [switch]$DryRun = $false
)

Write-Host "🔍 Finding merged branches..." -ForegroundColor Cyan

$mergedBranches = git branch --merged main |
    Where-Object { $_ -notmatch '\*' -and $_ -notmatch 'main' -and $_ -notmatch 'develop' } |
    ForEach-Object { $_.Trim() }

if ($mergedBranches.Count -eq 0) {
    Write-Host "✅ No merged branches to clean up" -ForegroundColor Green
    exit 0
}

Write-Host "`n📋 Found $($mergedBranches.Count) merged branches:" -ForegroundColor Yellow
$mergedBranches | ForEach-Object { Write-Host "  - $_" }

if ($DryRun) {
    Write-Host "`n🔒 DRY RUN - No branches deleted" -ForegroundColor Yellow
    Write-Host "Run without -DryRun to delete" -ForegroundColor Yellow
} else {
    Write-Host "`n🗑️ Deleting branches..." -ForegroundColor Red
    $mergedBranches | ForEach-Object {
        git branch -d $_
        Write-Host "  ✓ Deleted: $_" -ForegroundColor Green
    }
    Write-Host "`n✅ Cleanup complete!" -ForegroundColor Green
}
```

**Usage**:
```powershell
# Preview what would be deleted
.\cleanup-branches.ps1 -DryRun

# Actually delete
.\cleanup-branches.ps1
```

### Bash Script: Remote Cleanup
```bash
#!/bin/bash
# Save as: cleanup-remote-branches.sh

DRY_RUN=true

if [ "$1" = "--execute" ]; then
  DRY_RUN=false
fi

echo "🔍 Scanning remote branches..."

MERGED=$(git branch -r --merged origin/main | \
  grep -v "HEAD" | \
  grep -v "origin/main" | \
  grep -v "origin/develop" | \
  sed 's/origin\///')

if [ -z "$MERGED" ]; then
  echo "✅ No stale branches found"
  exit 0
fi

echo "📋 Found merged branches:"
echo "$MERGED"

if [ "$DRY_RUN" = true ]; then
  echo ""
  echo "🔒 DRY RUN - No branches deleted"
  echo "Run with --execute to delete"
else
  echo ""
  echo "🗑️ Deleting branches..."
  for branch in $MERGED; do
    git push origin --delete "$branch"
  done
  echo "✅ Done!"
fi
```

## 📈 Expected Results

### Before Cleanup
- 94+ branches (current)
- Confusion about active work
- Slow git operations
- Merge conflicts from outdated branches

### After Cleanup
- <10 active branches
- Clear branch purpose
- Fast git operations
- Clean repository overview

### Ongoing
- Auto-delete keeps it clean
- ~3-5 active feature branches
- No stale branches
- Easy to navigate

## 🚨 Safety Measures

### Before Deleting Any Branch
1. ✅ Verify it's merged to main
2. ✅ Check if anyone else is using it
3. ✅ Ensure no unmerged work
4. ✅ Use dry-run mode first

### Protected Branches
The workflow automatically protects:
- `main`
- `develop`
- `HEAD` references

### Recovery
If you accidentally delete a branch:
```bash
# Find the commit hash
git reflog

# Recreate the branch
git checkout -b branch-name <commit-hash>

# Or restore from remote (if it was pushed)
git checkout -b branch-name origin/branch-name
```

## 📚 Resources

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [Git Branch Management](https://git-scm.com/book/en/v2/Git-Branching-Branch-Management)
- [Trunk Based Development](https://trunkbaseddevelopment.com/)

## 🎓 Best Practices Summary

1. ✅ **Use descriptive branch names** with prefixes
2. ✅ **Delete branches immediately after merge**
3. ✅ **Keep main/develop clean and protected**
4. ✅ **Run cleanup monthly at minimum**
5. ✅ **Use auto-delete workflow for all PRs**
6. ✅ **Limit active branches to <10**
7. ✅ **Review branch health weekly**
8. ✅ **Document branch purpose in PR**

---

**Status**: ✅ Auto-cleanup enabled
**Next Cleanup**: Run manual workflow with dry_run=true
**Target**: Reduce to <10 active branches
