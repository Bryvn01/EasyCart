# Fix test imports to use test-utils.js

$testFiles = @(
    "frontend\src\__tests__\NotFound.test.js",
    "frontend\src\__tests__\EnhancedProductCard.test.js",
    "frontend\src\__tests__\CartContext.test.js",
    "frontend\src\__tests__\integration\AddToCartFlow.test.js",
    "frontend\src\pages\__tests__\Register.test.js",
    "frontend\src\pages\__tests__\Login.test.js"
)

foreach ($file in $testFiles) {
    $fullPath = "C:\EasyCart\$file"
    if (Test-Path $fullPath) {
        Write-Host "Fixing $file..."
        $content = Get-Content $fullPath -Raw

        # Replace import from @testing-library/react with ../test-utils or ../../test-utils
        if ($file -match "pages\\__tests__") {
            $content = $content -replace "from '@testing-library/react';", "from '../../test-utils';"
        } elseif ($file -match "integration\\") {
            $content = $content -replace "from '@testing-library/react';", "from '../../test-utils';"
        } else {
            $content = $content -replace "from '@testing-library/react';", "from '../test-utils';"
        }

        $content | Set-Content $fullPath -NoNewline
        Write-Host "Fixed $file"
    } else {
        Write-Host "File not found: $fullPath"
    }
}

Write-Host "`nAll test files have been updated!"
