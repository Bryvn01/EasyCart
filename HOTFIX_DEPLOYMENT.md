# 🚨 Deployment Hotfix Required

## Issue
Backend deployment failing: `ModuleNotFoundError: No module named 'pyotp'`

## Fix Applied
Added to `backend/requirements.txt`:
```
pyotp==2.9.0
qrcode==8.0
```

## Problem
Cannot push due to old commit with Twilio secret in history.

## Solution
1. **Allow the secret** (one-time): https://github.com/Bryvn01/EasyCart/security/secret-scanning/unblock-secret/36NnbUx539LzdDYoAo3gf9tLRDE

2. **Then push**:
```bash
git push origin main
```

## Alternative: Direct Render Fix
Add to Render environment and redeploy:
- No code push needed
- Just trigger manual deploy

The fix is ready locally, just needs to reach GitHub/Render.
