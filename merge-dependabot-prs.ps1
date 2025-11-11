#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Batch merge all passing Dependabot PRs
.DESCRIPTION
    This script checks all open Dependabot PRs, verifies their CI status,
    and automatically merges those with passing checks.
.PARAMETER DryRun
    If specified, shows what would be merged without actually merging
.PARAMETER AutoApprove
    If specified, automatically approves PRs before merging
.EXAMPLE
    .\merge-dependabot-prs.ps1
    .\merge-dependabot-prs.ps1 -DryRun
    .\merge-dependabot-prs.ps1 -AutoApprove
#>

param(
    [switch]$DryRun,
    [switch]$AutoApprove
)

# Colors for output
$script:Green = "Green"
$script:Yellow = "Yellow"
$script:Red = "Red"
$script:Cyan = "Cyan"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-GitHubCLI {
    Write-ColorOutput "🔍 Checking GitHub CLI installation..." $Cyan

    if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
        Write-ColorOutput "❌ GitHub CLI (gh) is not installed!" $Red
        Write-ColorOutput "📥 Install it from: https://cli.github.com/" $Yellow
        Write-ColorOutput "   Or run: winget install GitHub.cli" $Yellow
        return $false
    }

    Write-ColorOutput "✅ GitHub CLI found" $Green
    return $true
}

function Test-GitHubAuth {
    Write-ColorOutput "🔐 Checking GitHub authentication..." $Cyan

    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Not authenticated with GitHub!" $Red
        Write-ColorOutput "🔑 Run: gh auth login" $Yellow
        return $false
    }

    Write-ColorOutput "✅ Authenticated" $Green
    return $true
}

function Get-DependabotPRs {
    Write-ColorOutput "`n📋 Fetching Dependabot PRs..." $Cyan

    $prs = gh pr list --state open --author "app/dependabot" --json number,title,url,statusCheckRollup,mergeable --limit 100 | ConvertFrom-Json

    if (!$prs -or $prs.Count -eq 0) {
        Write-ColorOutput "ℹ️  No open Dependabot PRs found" $Yellow
        return @()
    }

    Write-ColorOutput "✅ Found $($prs.Count) Dependabot PRs" $Green
    return $prs
}

function Test-PRStatus {
    param($pr)

    # Check if PR is mergeable
    if ($pr.mergeable -ne "MERGEABLE") {
        return @{
            CanMerge = $false
            Reason = "Not mergeable (conflicts or pending changes)"
        }
    }

    # Check status checks
    if (!$pr.statusCheckRollup -or $pr.statusCheckRollup.Count -eq 0) {
        return @{
            CanMerge = $false
            Reason = "No status checks found (may still be running)"
        }
    }

    $failedChecks = $pr.statusCheckRollup | Where-Object { $_.conclusion -ne "SUCCESS" -and $_.conclusion -ne "SKIPPED" }

    if ($failedChecks) {
        $failedNames = ($failedChecks | ForEach-Object { $_.name }) -join ", "
        return @{
            CanMerge = $false
            Reason = "Failed checks: $failedNames"
        }
    }

    return @{
        CanMerge = $true
        Reason = "All checks passed"
    }
}

function Approve-PR {
    param($prNumber)

    try {
        gh pr review $prNumber --approve --body "✅ Automated approval: All checks passed" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "  ✅ Approved PR #$prNumber" $Green
            return $true
        }
    } catch {
        Write-ColorOutput "  ⚠️  Could not approve PR #$prNumber (may already be approved)" $Yellow
    }
    return $false
}

function Merge-PR {
    param($prNumber, $title)

    try {
        Write-ColorOutput "  🔄 Merging PR #$prNumber..." $Cyan

        gh pr merge $prNumber --squash --auto --delete-branch 2>&1 | Out-Null

        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "  ✅ Successfully merged: $title" $Green
            return $true
        } else {
            Write-ColorOutput "  ❌ Failed to merge PR #$prNumber" $Red
            return $false
        }
    } catch {
        Write-ColorOutput "  ❌ Error merging PR #$prNumber : $_" $Red
        return $false
    }
}

# Main Script
Write-ColorOutput "╔════════════════════════════════════════════════════════════╗" $Cyan
Write-ColorOutput "║   🤖 Dependabot PR Batch Merge Script                      ║" $Cyan
Write-ColorOutput "╚════════════════════════════════════════════════════════════╝" $Cyan

if ($DryRun) {
    Write-ColorOutput "`n🔍 DRY RUN MODE - No PRs will be merged" $Yellow
}

# Prerequisites check
if (!(Test-GitHubCLI)) { exit 1 }
if (!(Test-GitHubAuth)) { exit 1 }

# Get all Dependabot PRs
$allPRs = Get-DependabotPRs
if ($allPRs.Count -eq 0) {
    Write-ColorOutput "`n✨ Nothing to merge!" $Green
    exit 0
}

# Categorize PRs
$readyToMerge = @()
$notReady = @()
$pending = @()

Write-ColorOutput "`n📊 Analyzing PR status..." $Cyan

foreach ($pr in $allPRs) {
    $status = Test-PRStatus -pr $pr

    if ($status.CanMerge) {
        $readyToMerge += $pr
        Write-ColorOutput "  ✅ #$($pr.number): $($pr.title)" $Green
    } elseif ($status.Reason -match "still be running") {
        $pending += $pr
        Write-ColorOutput "  ⏳ #$($pr.number): $($pr.title) - $($status.Reason)" $Yellow
    } else {
        $notReady += $pr
        Write-ColorOutput "  ❌ #$($pr.number): $($pr.title) - $($status.Reason)" $Red
    }
}

# Summary
Write-ColorOutput "`n" $White
Write-ColorOutput "═══════════════════════════════════════════════════════════" $Cyan
Write-ColorOutput "📊 Summary:" $Cyan
Write-ColorOutput "  ✅ Ready to merge: $($readyToMerge.Count)" $Green
Write-ColorOutput "  ⏳ Pending checks: $($pending.Count)" $Yellow
Write-ColorOutput "  ❌ Not ready: $($notReady.Count)" $Red
Write-ColorOutput "  📋 Total PRs: $($allPRs.Count)" $Cyan
Write-ColorOutput "═══════════════════════════════════════════════════════════" $Cyan

if ($readyToMerge.Count -eq 0) {
    Write-ColorOutput "`n💡 No PRs are ready to merge yet." $Yellow
    if ($pending.Count -gt 0) {
        Write-ColorOutput "   ⏳ $($pending.Count) PR(s) still have checks running. Try again in a few minutes!" $Yellow
    }
    exit 0
}

# Merge PRs
if (!$DryRun) {
    Write-ColorOutput "`n🚀 Starting merge process..." $Cyan

    $mergeCount = 0
    $failCount = 0

    foreach ($pr in $readyToMerge) {
        Write-ColorOutput "`n📦 Processing PR #$($pr.number): $($pr.title)" $Cyan

        # Auto-approve if requested
        if ($AutoApprove) {
            Approve-PR -prNumber $pr.number
        }

        # Merge PR
        if (Merge-PR -prNumber $pr.number -title $pr.title) {
            $mergeCount++
            Start-Sleep -Seconds 2  # Rate limiting
        } else {
            $failCount++
        }
    }

    # Final summary
    Write-ColorOutput "`n" $White
    Write-ColorOutput "╔════════════════════════════════════════════════════════════╗" $Cyan
    Write-ColorOutput "║   🎉 Merge Complete!                                       ║" $Cyan
    Write-ColorOutput "╚════════════════════════════════════════════════════════════╝" $Cyan
    Write-ColorOutput "`n✅ Successfully merged: $mergeCount PRs" $Green

    if ($failCount -gt 0) {
        Write-ColorOutput "❌ Failed to merge: $failCount PRs" $Red
    }

    if ($pending.Count -gt 0) {
        Write-ColorOutput "⏳ Still pending: $($pending.Count) PRs (run script again later)" $Yellow
    }

} else {
    Write-ColorOutput "`n🔍 DRY RUN - Would merge the following PRs:" $Yellow
    foreach ($pr in $readyToMerge) {
        Write-ColorOutput "  • #$($pr.number): $($pr.title)" $Cyan
        Write-ColorOutput "    $($pr.url)" $Yellow
    }
    Write-ColorOutput "`n💡 Run without -DryRun to actually merge these PRs" $Green
}

Write-ColorOutput "`n✨ Done!" $Green
