# Environment Setup Guide

## Issue: npm PATH Configuration

### Problem
The system's `npm` command was pointing to a broken installation at `C:\Windows\system32\npm` instead of the proper Node.js installation at `C:\Program Files\nodejs\npm.cmd`.

### Symptoms
- `npm install` commands complete instantly without installing packages
- Webpack errors about missing modules (e.g., `react-icons/fi`)
- No error messages from npm commands

## Permanent Fix

### Option 1: Fix System PATH (Recommended)

1. **Open Environment Variables**:
   - Press `Win + X` and select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"

2. **Edit PATH Variable**:
   - Under "User variables" or "System variables", find `Path`
   - Click "Edit"
   - Ensure `C:\Program Files\nodejs` is at or near the TOP of the list
   - Remove any npm-related entries from `C:\Windows\system32`
   - Click "OK" on all dialogs

3. **Restart PowerShell**:
   - Close all PowerShell windows
   - Open a new PowerShell window
   - Verify: `Get-Command npm` should show `C:\Program Files\nodejs\npm`

4. **Verify Installation**:
   ```powershell
   cd c:\EasyCart\frontend
   npm run validate-env
   ```

### Option 2: Use .npmrc Configuration

The `.npmrc` file in the frontend directory has been configured with:
- `engine-strict=true` - Enforces Node.js version requirements
- `loglevel=warn` - Shows warnings if npm has issues
- `legacy-peer-deps=true` - Handles peer dependency conflicts

### Option 3: Temporary Workaround

If you can't modify system PATH immediately, use the full npm path:

```powershell
cd c:\EasyCart\frontend

# Install packages
& "C:\Program Files\nodejs\npm.cmd" install

# Start development server
& "C:\Program Files\nodejs\npm.cmd" start

# Run other commands
& "C:\Program Files\nodejs\npm.cmd" run build
```

## Validation Script

Run the environment validation script to check your setup:

```powershell
cd c:\EasyCart\frontend
npm run validate-env
```

This script checks:
- ✓ Node.js installation and version
- ✓ npm installation and location
- ✓ Presence of node_modules
- ✓ Critical dependencies (like react-icons)
- ✓ Engine requirements from package.json

## Package.json Updates

### Added Engines Field
```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

This ensures the project requires compatible Node.js and npm versions.

### Added Validation Script
```json
"scripts": {
  "validate-env": "powershell -ExecutionPolicy Bypass -File ../scripts/validate-environment.ps1"
}
```

## Dependencies Fixed

### react-icons
- **Issue**: Missing from dependencies
- **Fix**: Added `"react-icons": "^5.5.0"` to dependencies
- **Usage**: Used by `BottomNav.js` and other mobile components

### design-system.css
- **Issue**: Incorrect import path in `index.css`
- **Fix**: Changed from `@import '../styles/design-system.css'` to `@import './styles/design-system.css'`
- **Location**: `frontend/src/styles/design-system.css`

## Best Practices Applied

1. **Version Pinning**: Using `engines` field to specify minimum versions
2. **Configuration Management**: Using `.npmrc` for consistent npm behavior
3. **Environment Validation**: Automated script to detect configuration issues
4. **Clear Error Messages**: Validation script provides actionable fixes
5. **Documentation**: Complete guide for developers

## Verification Steps

After applying the fix:

1. **Verify npm location**:
   ```powershell
   Get-Command npm
   # Should show: C:\Program Files\nodejs\npm
   ```

2. **Clean install**:
   ```powershell
   cd c:\EasyCart\frontend
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   ```

3. **Verify react-icons**:
   ```powershell
   Test-Path node_modules\react-icons
   # Should return: True
   ```

4. **Start development server**:
   ```powershell
   npm start
   # Should compile without "Cannot find module 'react-icons/fi'" error
   ```

## Common Issues

### Issue: npm commands still don't work after PATH change
**Solution**: Restart your computer to ensure all PATH changes take effect

### Issue: "execution policy" error when running validation script
**Solution**: Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: node_modules keeps getting corrupted
**Solution**:
1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules and package-lock.json
3. Reinstall: `npm install`

## Related Files

- `frontend/.npmrc` - npm configuration
- `frontend/package.json` - Dependencies and scripts
- `scripts/validate-environment.ps1` - Environment validation script
- `frontend/src/index.css` - CSS imports configuration

## Testing

After applying fixes, test these scenarios:

1. ✓ npm install completes with package count
2. ✓ Development server starts without errors
3. ✓ react-icons imports work correctly
4. ✓ CSS files load properly
5. ✓ Hot reload works during development
