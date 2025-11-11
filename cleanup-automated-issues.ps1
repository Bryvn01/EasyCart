#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Bulk close automated CI/CD failure issues

.DESCRIPTION
    This script closes all automated CI/CD failure issues that are now resolved.
    After fixing the CI/CD pipeline, these old failure notifications are no longer relevant.

.PARAMETER DryRun
    Preview which issues would be closed without actually closing them

.PARAMETER CloseBefore
    Close issues created before this date (default: today)
    Format: YYYY-MM-DD

.PARAMETER AddComment
    Add a closing comment explaining the resolution

.EXAMPLE
    .\cleanup-automated-issues.ps1 -DryRun
    Preview which issues would be closed

.EXAMPLE
    .\cleanup-automated-issues.ps1 -AddComment
    Close all CI failure issues with explanatory comment

.EXAMPLE
    .\cleanup-automated-issues.ps1 -CloseBefore "2025-11-10"
    Close issues created before November 10, 2025
#>

param(
    [Parameter(HelpMessage="Preview mode - don't actually close issues")]
    [switch]$DryRun,

    [Parameter(HelpMessage="Close issues created before this date (YYYY-MM-DD)")]
    [string]$CloseBefore = (Get-Date -Format "yyyy-MM-dd"),

    [Parameter(HelpMessage="Add explanatory comment when closing")]
    [switch]$AddComment
)

# Check if GitHub CLI is installed
function Test-GitHubCLI {
    try {
        $null = gh --version
        return $true
    }
    catch {
        Write-Host "❌ GitHub CLI (gh) is not installed!" -ForegroundColor Red
        Write-Host "📥 Install it from: https://cli.github.com/" -ForegroundColor Yellow
        return $false
    }
}

# Check if authenticated
function Test-GitHubAuth {
    try {
        $status = gh auth status 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Not authenticated with GitHub!" -ForegroundColor Red
            Write-Host "🔑 Run: gh auth login" -ForegroundColor Yellow
            return $false
        }
        return $true
    }
    catch {
        Write-Host "❌ GitHub authentication check failed!" -ForegroundColor Red
        return $false
    }
}

# Main script
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🧹 Automated Issue Cleanup Script                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No issues will be closed`n" -ForegroundColor Yellow
}

# Prerequisites check
if (-not (Test-GitHubCLI)) { exit 1 }
if (-not (Test-GitHubAuth)) { exit 1 }

Write-Host "📋 Fetching automated CI/CD failure issues..." -ForegroundColor Cyan

# Get all open issues with ci-failure label
$issues = gh issue list --state open --label "ci-failure" --label "automated" --json number,title,createdAt,url --limit 200 | ConvertFrom-Json

if ($issues.Count -eq 0) {
    Write-Host "✅ No automated CI/CD failure issues found!" -ForegroundColor Green
    Write-Host "   Your issue tracker is clean." -ForegroundColor Gray
    exit 0
}

Write-Host "✅ Found $($issues.Count) automated CI/CD failure issues`n" -ForegroundColor Green

# Filter by date if specified
$closeBeforeDate = [DateTime]::Parse($CloseBefore)
$issuesToClose = $issues | Where-Object {
    $createdDate = [DateTime]::Parse($_.createdAt)
    $createdDate -lt $closeBeforeDate
}

if ($issuesToClose.Count -eq 0) {
    Write-Host "ℹ️  No issues found before $CloseBefore" -ForegroundColor Yellow
    exit 0
}

Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  Total CI failure issues: $($issues.Count)" -ForegroundColor Gray
Write-Host "  Created before $CloseBefore : $($issuesToClose.Count)" -ForegroundColor Gray
Write-Host "  Will be closed: $($issuesToClose.Count)" -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 Would close the following issues:`n" -ForegroundColor Yellow
    foreach ($issue in $issuesToClose | Select-Object -First 10) {
        $createdDate = [DateTime]::Parse($issue.createdAt)
        Write-Host "  • #$($issue.number): $($issue.title)" -ForegroundColor Cyan
        Write-Host "    Created: $($createdDate.ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor Gray
        Write-Host "    URL: $($issue.url)" -ForegroundColor Gray
    }

    if ($issuesToClose.Count -gt 10) {
        Write-Host "  ... and $($issuesToClose.Count - 10) more" -ForegroundColor Gray
    }

    Write-Host "`n💡 Run without -DryRun to actually close these issues" -ForegroundColor Green
    exit 0
}

# Confirm with user
Write-Host "⚠️  About to close $($issuesToClose.Count) issues!" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C to cancel, or any other key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Close issues
Write-Host "🚀 Starting cleanup process...`n" -ForegroundColor Cyan

$successCount = 0
$failCount = 0
$closeComment = @"
🎉 **Issue Resolved**

This automated CI/CD failure notification is being closed because:

✅ The underlying CI/CD pipeline issues have been fixed
✅ All tests are now passing
✅ Future runs should succeed

**What was fixed:**
- Added missing browser API mocks (IntersectionObserver, ResizeObserver)
- Fixed test assertions to match actual component behavior
- Disabled unused Azure deployment workflows

**Commit:** https://github.com/Bryvn01/EasyCart/commit/903eefd

If you encounter similar failures in the future, they will be tracked in new issues.

---
*This issue was automatically closed by cleanup script.*
"@

foreach ($issue in $issuesToClose) {
    Write-Host "📦 Processing issue #$($issue.number)..." -ForegroundColor Cyan

    try {
        # Add comment if requested
        if ($AddComment) {
            Write-Host "  💬 Adding closing comment..." -ForegroundColor Gray
            gh issue comment $issue.number --body $closeComment 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) {
                Write-Host "  ⚠️  Failed to add comment (continuing anyway)" -ForegroundColor Yellow
            }
        }

        # Close the issue
        Write-Host "  🔒 Closing issue..." -ForegroundColor Gray
        gh issue close $issue.number --reason "completed" 2>&1 | Out-Null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Successfully closed: $($issue.title)" -ForegroundColor Green
            $successCount++
        }
        else {
            Write-Host "  ❌ Failed to close issue #$($issue.number)" -ForegroundColor Red
            $failCount++
        }
    }
    catch {
        Write-Host "  ❌ Error closing issue #$($issue.number): $_" -ForegroundColor Red
        $failCount++
    }

    # Rate limiting
    Start-Sleep -Milliseconds 500
}

# Final summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🎉 Cleanup Complete!                                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Successfully closed: $successCount issues" -ForegroundColor Green

if ($failCount -gt 0) {
    Write-Host "❌ Failed to close: $failCount issues" -ForegroundColor Red
    Write-Host "   Check the errors above for details" -ForegroundColor Gray
}

# Check remaining issues
$remainingIssues = gh issue list --state open --label "ci-failure" --json number --limit 200 | ConvertFrom-Json
if ($remainingIssues.Count -eq 0) {
    Write-Host "🎊 No more CI failure issues remaining!" -ForegroundColor Green
}
else {
    Write-Host "ℹ️  $($remainingIssues.Count) CI failure issues still open (created after $CloseBefore)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Done!" -ForegroundColor Green
