# Branch Cleanup Script
param(
    [switch]$DryRun = $true,
    [switch]$RemoveRemote = $false
)

Write-Host "`nEasyCart Branch Cleanup Tool`n" -ForegroundColor Cyan

git fetch --prune origin 2>&1 | Out-Null
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $currentBranch`n" -ForegroundColor Green

Write-Host "Scanning local branches merged to main..." -ForegroundColor Cyan
$mergedLocal = @(git branch --merged main | Where-Object { $_ -notmatch '\*|^\s*main$|^\s*develop$' } | ForEach-Object { $_.Trim() })

if ($mergedLocal.Count -eq 0) {
    Write-Host "No local merged branches`n" -ForegroundColor Green
} else {
    Write-Host "Found $($mergedLocal.Count) merged local branches:" -ForegroundColor Yellow
    $mergedLocal | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }

    if ($DryRun) {
        Write-Host "`nDRY RUN - No local branches deleted" -ForegroundColor Yellow
    } else {
        Write-Host "`nDeleting local branches..." -ForegroundColor Red
        foreach ($branch in $mergedLocal) {
            git branch -d $branch 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Deleted: $branch" -ForegroundColor Green
            } else {
                Write-Host "  Failed: $branch" -ForegroundColor Red
            }
        }
    }
}

if ($RemoveRemote) {
    Write-Host "`nScanning remote branches..." -ForegroundColor Cyan
    $mergedRemote = @(git branch -r --merged origin/main | Where-Object { $_ -notmatch 'HEAD|origin/main|origin/develop' } | ForEach-Object { $_.Trim() -replace 'origin/', '' })

    if ($mergedRemote.Count -eq 0) {
        Write-Host "No remote merged branches`n" -ForegroundColor Green
    } else {
        Write-Host "Found $($mergedRemote.Count) merged remote branches:" -ForegroundColor Yellow
        $mergedRemote | ForEach-Object { Write-Host "  - origin/$_" -ForegroundColor Gray }

        if ($DryRun) {
            Write-Host "`nDRY RUN - No remote branches deleted" -ForegroundColor Yellow
        } else {
            Write-Host "`nWARNING: DELETING REMOTE BRANCHES!`n" -ForegroundColor Red
            $confirm = Read-Host "Type DELETE to confirm"
            if ($confirm -eq 'DELETE') {
                foreach ($branch in $mergedRemote) {
                    git push origin --delete $branch 2>&1 | Out-Null
                    Write-Host "  Deleted: origin/$branch" -ForegroundColor Green
                }
            } else {
                Write-Host "Cancelled" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  Local branches: $((git branch | Measure-Object -Line).Lines)" -ForegroundColor White
Write-Host "  Remote branches: $((git branch -r | Where-Object { $_ -notmatch 'HEAD' } | Measure-Object -Line).Lines)" -ForegroundColor White
Write-Host "  Merged local: $($mergedLocal.Count)" -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "`nTo delete: .\cleanup-branches.ps1 -DryRun:`$false" -ForegroundColor Cyan
}

Write-Host "`nScan complete!`n" -ForegroundColor Green
