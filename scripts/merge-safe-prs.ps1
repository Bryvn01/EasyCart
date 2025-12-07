# PowerShell script to merge safe Dependabot PRs

Write-Host "Dependabot PR Merge Tool" -ForegroundColor Cyan
Write-Host ""

# Safe PRs to merge
$safePRs = @(379, 337, 336, 406, 405)

Write-Host "Safe PRs to merge:" -ForegroundColor Green
foreach ($prNum in $safePRs) {
    Write-Host "  PR #$prNum" -ForegroundColor White
}

Write-Host ""
$response = Read-Host "Merge these PRs? (y/n)"

if ($response -eq 'y') {
    Write-Host ""
    foreach ($prNum in $safePRs) {
        Write-Host "Merging PR #$prNum..." -ForegroundColor Cyan
        gh pr merge $prNum --squash --auto 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Success" -ForegroundColor Green
        } else {
            Write-Host "  Failed" -ForegroundColor Yellow
        }
    }
    Write-Host ""
    Write-Host "Complete!" -ForegroundColor Green
} else {
    Write-Host "Cancelled" -ForegroundColor Red
}
