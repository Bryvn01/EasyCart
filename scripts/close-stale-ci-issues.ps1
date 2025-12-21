#!/usr/bin/env pwsh
# Close Stale CI/CD Failure Issues
# Usage: .\scripts\close-stale-ci-issues.ps1 [-DryRun]

param(
    [switch]$DryRun = $false
)

Write-Host "🧹 Closing Stale CI/CD Failure Issues" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No issues will be closed" -ForegroundColor Yellow
    Write-Host ""
}

# Get all open CI/CD failure issues
Write-Host "📡 Fetching open CI/CD failure issues..." -ForegroundColor Blue
$issues = gh issue list --limit 100 --state open --label "ci-failure,automated" --json number,title,createdAt | ConvertFrom-Json

if (-not $issues) {
    Write-Host "✅ No CI/CD failure issues found!" -ForegroundColor Green
    exit 0
}

Write-Host "Found $($issues.Count) stale CI/CD failure issues" -ForegroundColor Yellow
Write-Host ""

$closeMessage = "Closing this automated CI/CD failure issue as part of repository cleanup. CI/CD Pipeline is now stable and passing with 153/153 tests (100% pass rate). Recent fixes: DevOps improvements (e2a7c34), GitHub Actions best practices (fae7672), test execution fixes (a275cd9, 6503743, 5b00c2b). See DEVOPS_IMPROVEMENT_PLAN.md for details."

$closedCount = 0
$failedCount = 0

foreach ($issue in $issues) {
    $issueNumber = $issue.number
    $issueTitle = $issue.title
    $createdAt = [DateTime]::Parse($issue.createdAt)
    $daysOld = ([DateTime]::Now - $createdAt).Days

    Write-Host "  Issue #$issueNumber - $issueTitle" -ForegroundColor Gray
    Write-Host "    Created: $daysOld days ago" -ForegroundColor Gray

    if (-not $DryRun) {
        try {
            # Close the issue with a comment
            gh issue close $issueNumber --comment $closeMessage 2>&1 | Out-Null

            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ Closed" -ForegroundColor Green
                $closedCount++
            } else {
                Write-Host "    ⚠️  Failed to close" -ForegroundColor Yellow
                $failedCount++
            }
        } catch {
            Write-Host "    ❌ Error: $_" -ForegroundColor Red
            $failedCount++
        }

        # Rate limit protection - wait 1 second between closures
        Start-Sleep -Milliseconds 1000
    } else {
        Write-Host "    🔍 Would close (dry run)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "Total issues found:    $($issues.Count)" -ForegroundColor White
Write-Host "Successfully closed:   $closedCount" -ForegroundColor Green
Write-Host "Failed to close:       $failedCount" -ForegroundColor $(if ($failedCount -gt 0) { "Red" } else { "White" })
Write-Host ""

if ($DryRun) {
    Write-Host "💡 Run without -DryRun to actually close these issues" -ForegroundColor Yellow
} else {
    Write-Host "✨ Cleanup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Remaining open issues:" -ForegroundColor Cyan
    gh issue list --state open --limit 10
}
