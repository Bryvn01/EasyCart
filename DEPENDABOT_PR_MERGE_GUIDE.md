# 📦 Dependabot PR Batch Merge Guide

## Overview

This guide explains how to use the automated scripts to batch-merge all passing Dependabot PRs. After fixing the CI/CD test failures, GitHub will automatically rebase all 50+ open Dependabot PRs, and these scripts will help you merge them efficiently.

## 📋 Prerequisites

### 1. GitHub CLI Installation

#### Windows (PowerShell)
```powershell
# Using winget
winget install GitHub.cli

# Or using Chocolatey
choco install gh

# Or download installer from https://cli.github.com/
```

#### macOS
```bash
brew install gh
```

#### Linux
```bash
# Debian/Ubuntu
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Fedora/CentOS/RHEL
sudo dnf install gh
```

### 2. GitHub Authentication

```bash
gh auth login
```

Follow the prompts to authenticate:
- Select **GitHub.com**
- Select **HTTPS** protocol
- Authenticate via **web browser** (recommended)

Verify authentication:
```bash
gh auth status
```

## 🚀 Usage

### PowerShell Script (Windows)

#### Dry Run (Preview Only)
```powershell
.\merge-dependabot-prs.ps1 -DryRun
```

This will:
- ✅ Check which PRs are ready to merge
- ⏳ Show PRs with pending checks
- ❌ Show PRs that aren't mergeable
- 📊 Display summary statistics
- **NOT merge anything**

#### Actual Merge (Without Auto-Approve)
```powershell
.\merge-dependabot-prs.ps1
```

This will:
- Merge all PRs that are ready
- Skip auto-approval (assumes PRs were approved manually or by CI)
- Delete merged branches automatically

#### Merge with Auto-Approval
```powershell
.\merge-dependabot-prs.ps1 -AutoApprove
```

This will:
- Auto-approve each PR before merging
- Merge all ready PRs
- Delete merged branches automatically

### Bash Script (Linux/macOS/WSL)

First, make the script executable:
```bash
chmod +x merge-dependabot-prs.sh
```

#### Dry Run
```bash
./merge-dependabot-prs.sh --dry-run
```

#### Actual Merge
```bash
./merge-dependabot-prs.sh
```

#### Merge with Auto-Approval
```bash
./merge-dependabot-prs.sh --auto-approve
```

## 📊 Script Output Explained

### Status Categories

| Symbol | Status | Meaning |
|--------|--------|---------|
| ✅ | Ready to merge | All checks passed, PR is mergeable |
| ⏳ | Pending | Checks still running, try again later |
| ❌ | Not ready | Checks failed or PR has conflicts |

### Example Output

```
╔════════════════════════════════════════════════════════════╗
║   🤖 Dependabot PR Batch Merge Script                      ║
╚════════════════════════════════════════════════════════════╝

📋 Fetching Dependabot PRs...
✅ Found 52 Dependabot PRs

📊 Analyzing PR status...
  ✅ #123: Bump @testing-library/react from 14.0.0 to 16.1.0
  ✅ #124: Bump eslint from 8.0.0 to 9.18.0
  ⏳ #125: Bump django from 4.2.0 to 5.1.7 - Checks still running
  ❌ #126: Bump pytest from 7.0.0 to 8.3.4 - Failed checks

═══════════════════════════════════════════════════════════
📊 Summary:
  ✅ Ready to merge: 48
  ⏳ Pending checks: 3
  ❌ Not ready: 1
  📋 Total PRs: 52
═══════════════════════════════════════════════════════════

🚀 Starting merge process...
```

## ⏰ Timeline

### Phase 1: Main Branch CI (CURRENT)
**Duration:** 3-5 minutes
**Status:** Running now
**Action:** Wait for GitHub Actions to complete

Check status at: https://github.com/Bryvn01/EasyCart/actions

### Phase 2: Dependabot Auto-Rebase
**Duration:** 1-2 hours after main CI passes
**Status:** Queued
**Action:** GitHub automatically rebases all open PRs

You'll see activity in your GitHub notifications as each PR is rebased.

### Phase 3: PR CI Checks
**Duration:** 3-5 minutes per PR
**Status:** Pending rebase
**Action:** Each rebased PR runs CI checks

All PRs should pass now that the test fixes are in `main`.

### Phase 4: Batch Merge
**Duration:** 5-10 minutes (depending on PR count)
**Status:** Ready to execute
**Action:** Run the merge script

## 🔍 Troubleshooting

### "GitHub CLI (gh) is not installed"
Install GitHub CLI using instructions in Prerequisites section above.

### "Not authenticated with GitHub"
Run `gh auth login` and follow the prompts.

### "No open Dependabot PRs found"
Either:
- All PRs have already been merged ✅
- PRs haven't been created yet (check your Dependabot configuration)

### "No PRs are ready to merge yet"
This is normal! Possible reasons:
- ⏳ Main branch CI still running (wait 3-5 minutes)
- ⏳ Dependabot hasn't rebased yet (wait 1-2 hours)
- ⏳ PR checks still running (wait a few more minutes)

### Some PRs show "Failed checks"
After the auto-rebase, if PRs still fail:
1. Check the CI logs for that specific PR
2. May indicate a merge conflict or dependency incompatibility
3. Consider merging manually or closing if outdated

### "Failed to merge PR #XXX"
Possible reasons:
- PR requires manual approval (add `-AutoApprove` flag)
- PR has conflicts (resolve manually)
- Branch protection rules blocking merge
- Rate limit hit (script has 2-second delays to prevent this)

## 📈 Best Practices

### 1. Always Dry Run First
```powershell
.\merge-dependabot-prs.ps1 -DryRun
```
This lets you preview what will happen without making changes.

### 2. Monitor the Process
Don't walk away during the merge! Watch for:
- Failed merges
- Unexpected behavior
- Rate limiting warnings

### 3. Run Multiple Times if Needed
If you have pending PRs, run the script again after they complete:
```powershell
# First run: merges 45 ready PRs
.\merge-dependabot-prs.ps1

# Wait 5 minutes for remaining checks...

# Second run: merges the rest
.\merge-dependabot-prs.ps1
```

### 4. Verify After Completion
After all merges:
```bash
# Check remaining open PRs
gh pr list --state open --author "app/dependabot"

# Verify no security vulnerabilities remain
gh api repos/:owner/:repo/vulnerability-alerts
```

## 🔒 Security Notes

### Why Auto-Merge Dependabot PRs?

Dependabot PRs are dependency updates that:
- ✅ Fix known security vulnerabilities
- ✅ Include automated tests
- ✅ Are vetted by GitHub's security team
- ✅ Follow semantic versioning

Your current repo has **17 vulnerabilities** (2 critical, 10 high, 3 moderate, 2 low) that will be fixed by merging these PRs.

### Safety Mechanisms

The scripts include:
- ✅ **Dry run mode** - preview before merging
- ✅ **Status checks** - only merge if all CI passes
- ✅ **Mergeable validation** - skip PRs with conflicts
- ✅ **Rate limiting** - 2-second delays between merges
- ✅ **Error handling** - continues on failures, reports at end

## 📚 Additional Resources

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🎉 Success Indicators

You'll know it worked when:
- ✅ All Dependabot PRs are merged or closed
- ✅ Security vulnerabilities count drops to 0
- ✅ `npm audit` or `pip check` show no critical issues
- ✅ Main branch CI is green
- ✅ No open PRs from `app/dependabot`

## 💡 Tips

1. **Run during low-activity hours** - Less chance of conflicts with other development
2. **Create a backup branch first** - `git checkout -b backup-before-merge`
3. **Check package.json changes** - Review major version bumps manually
4. **Test locally after merge** - Run `npm install` and `npm test` to verify
5. **Monitor for regressions** - Check production after deployment

---

**Questions or issues?** Check the troubleshooting section or open an issue in the repository.
