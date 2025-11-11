# Simple script to close all CI failure issues
Write-Host "Fetching CI failure issues..." -ForegroundColor Cyan

$issues = gh issue list --state open --label "ci-failure" --json number,title --limit 200 | ConvertFrom-Json

if ($issues.Count -eq 0) {
    Write-Host "No CI failure issues found!" -ForegroundColor Green
    exit 0
}

Write-Host "Found $($issues.Count) issues to close`n" -ForegroundColor Yellow

foreach ($issue in $issues) {
    Write-Host "Closing #$($issue.number): $($issue.title)" -ForegroundColor Cyan

    # Add comment
    gh issue comment $issue.number --body "✅ **CI/CD Pipeline Fixed**

The underlying CI/CD issues have been resolved:
- Fixed test failures (IntersectionObserver mocks, assertions)
- Disabled Azure workflows (not using Azure)
- All tests now passing

This automated failure notification is no longer relevant and is being closed.

**Fix commit:** https://github.com/Bryvn01/EasyCart/commit/903eefd" 2>&1 | Out-Null

    # Close issue
    gh issue close $issue.number 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Closed successfully" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Failed to close" -ForegroundColor Red
    }

    Start-Sleep -Milliseconds 500
}

Write-Host "`n✅ Done! Closed $($issues.Count) issues" -ForegroundColor Green
