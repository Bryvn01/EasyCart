#!/usr/bin/env pwsh
# Branch Cleanup Script - Professional Repository Management
# Usage: .\scripts\cleanup-branches.ps1 [-DryRun] [-DeleteMerged] [-DeleteStale]

param(
    [switch]$DryRun = $false,
    [switch]$DeleteMerged = $false,
    [switch]$DeleteStale = $false,
    [switch]$DeleteDependabot = $false,
    [int]$StaleDays = 30
)

Write-Host "🧹 EasyCart Branch Cleanup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No branches will be deleted" -ForegroundColor Yellow
    Write-Host ""
}

# Fetch latest remote data
Write-Host "📡 Fetching latest remote data..." -ForegroundColor Blue
git fetch --all --prune

# Function to get branch age in days
function Get-BranchAge {
    param([string]$Branch)

    $lastCommitDate = git log -1 --format="%ct" "origin/$Branch" 2>$null
    if ($lastCommitDate) {
        $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
        $days = [math]::Floor(($now - $lastCommitDate) / 86400)
        return $days
    }
    return -1
}

# 1. Delete merged copilot/fix branches
if ($DeleteMerged) {
    Write-Host ""
    Write-Host "🔍 Finding merged copilot/fix branches..." -ForegroundColor Blue

    $mergedBranches = git branch -r --merged origin/main |
        Where-Object { $_ -match "copilot/fix-" } |
        ForEach-Object { $_.Trim() -replace "origin/", "" }

    if ($mergedBranches) {
        Write-Host "Found $($mergedBranches.Count) merged branches:" -ForegroundColor Green

        foreach ($branch in $mergedBranches) {
            Write-Host "  🗑️  $branch" -ForegroundColor Gray

            if (-not $DryRun) {
                git push origin --delete $branch 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "     ✅ Deleted" -ForegroundColor Green
                } else {
                    Write-Host "     ⚠️  Failed (may already be deleted)" -ForegroundColor Yellow
                }
            }
        }
    } else {
        Write-Host "✅ No merged copilot/fix branches found" -ForegroundColor Green
    }
}

# 2. Delete stale branches (30+ days no activity)
if ($DeleteStale) {
    Write-Host ""
    Write-Host "🔍 Finding stale branches (${StaleDays}+ days)..." -ForegroundColor Blue

    $allBranches = git branch -r |
        Where-Object { $_ -notmatch "HEAD|main|develop" } |
        ForEach-Object { $_.Trim() -replace "origin/", "" }

    $staleBranches = @()

    foreach ($branch in $allBranches) {
        $age = Get-BranchAge -Branch $branch

        if ($age -gt $StaleDays) {
            $staleBranches += [PSCustomObject]@{
                Name = $branch
                Age = $age
            }
        }
    }

    if ($staleBranches) {
        Write-Host "Found $($staleBranches.Count) stale branches:" -ForegroundColor Green

        $staleBranches | Sort-Object Age -Descending | ForEach-Object {
            Write-Host "  📅 $($_.Name) ($($_.Age) days old)" -ForegroundColor Gray

            if (-not $DryRun) {
                $confirm = Read-Host "Delete this branch? (y/N)"
                if ($confirm -eq 'y') {
                    git push origin --delete $_.Name 2>$null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "     ✅ Deleted" -ForegroundColor Green
                    } else {
                        Write-Host "     ⚠️  Failed" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "     ⏭️  Skipped" -ForegroundColor Yellow
                }
            }
        }
    } else {
        Write-Host "✅ No stale branches found" -ForegroundColor Green
    }
}

# 3. Review Dependabot branches
if ($DeleteDependabot) {
    Write-Host ""
    Write-Host "🔍 Finding Dependabot branches..." -ForegroundColor Blue

    $dependabotBranches = git branch -r |
        Where-Object { $_ -match "dependabot/" } |
        ForEach-Object { $_.Trim() -replace "origin/", "" }

    if ($dependabotBranches) {
        Write-Host "Found $($dependabotBranches.Count) Dependabot branches:" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  Please review these on GitHub first:" -ForegroundColor Yellow
        Write-Host "   Check if PRs are merged or closed" -ForegroundColor Yellow
        Write-Host ""

        foreach ($branch in $dependabotBranches) {
            $age = Get-BranchAge -Branch $branch
            Write-Host "  📦 $branch ($age days old)" -ForegroundColor Gray

            if (-not $DryRun) {
                $confirm = Read-Host "Delete this branch? (y/N)"
                if ($confirm -eq 'y') {
                    git push origin --delete $branch 2>$null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "     ✅ Deleted" -ForegroundColor Green
                    } else {
                        Write-Host "     ⚠️  Failed" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "     ⏭️  Skipped" -ForegroundColor Yellow
                }
            }
        }
    } else {
        Write-Host "✅ No Dependabot branches found" -ForegroundColor Green
    }
}

# Summary
Write-Host ""
Write-Host "📊 Current Branch Summary" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

$totalRemote = (git branch -r | Where-Object { $_ -notmatch "HEAD" }).Count
$totalLocal = (git branch | Where-Object { $_ -notmatch "\*" }).Count

Write-Host "Remote branches: $totalRemote" -ForegroundColor White
Write-Host "Local branches:  $totalLocal" -ForegroundColor White
Write-Host ""

if (-not ($DeleteMerged -or $DeleteStale -or $DeleteDependabot)) {
    Write-Host "💡 Usage Examples:" -ForegroundColor Yellow
    Write-Host "  .\scripts\cleanup-branches.ps1 -DryRun -DeleteMerged" -ForegroundColor Gray
    Write-Host "  .\scripts\cleanup-branches.ps1 -DeleteMerged" -ForegroundColor Gray
    Write-Host "  .\scripts\cleanup-branches.ps1 -DeleteStale -StaleDays 60" -ForegroundColor Gray
    Write-Host "  .\scripts\cleanup-branches.ps1 -DeleteDependabot" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "✨ Cleanup complete!" -ForegroundColor Green
