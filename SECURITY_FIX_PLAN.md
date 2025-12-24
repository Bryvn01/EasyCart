# 🔒 Security Fix Plan - EasyCart

**Generated:** December 24, 2025
**Status:** Action Required

---

## 📊 Dependabot Vulnerability Summary

### Critical Open Issues
- **0 Critical** (previously 1 - now fixed with Django 5.2.9)

### High-Priority Open Issues (7)
1. **urllib3** (2 issues) - `backend/temp_requirements.txt`
   - Streaming API improperly handles highly compressed data
   - Allows unbounded number of links in decompression chain
   - **Action:** Update urllib3 to latest version

2. **next** (2 issues) - `frontend/package-lock.json`
   - Denial of Service with Server Components
   - **Action:** Update Next.js to latest stable version

3. **ip** (1 issue) - `mobile/package-lock.json`
   - SSRF improper categorization in isPublic
   - **Action:** Update ip package to patched version

4. **jws** (1 issue) - `backend/package-lock.json`
   - Improperly Verifies HMAC Signature
   - **Action:** Update jws package to patched version

5. **validator** (1 issue) - `backend/package-lock.json`
   - Vulnerable to Incomplete Filtering
   - **Action:** Update validator package to patched version

### Medium-Priority Open Issues (4)
- **Django** (2 issues) - `backend/temp_requirements.txt`
  - DoS via XML serializer text extraction
  - SQL injection in column aliases
  - **Action:** Update Django in temp_requirements.txt

- **body-parser** (1 issue) - `backend/package-lock.json`
  - Vulnerable to denial of service when url encoding is used
  - **Action:** Update body-parser package

---

## 🎯 Priority Action Plan

### Phase 1: Immediate (High-Priority) - Next 24 Hours

#### 1.1 Backend Python Dependencies
```powershell
cd C:\EasyCart\backend

# Update urllib3
pip install --upgrade urllib3

# Regenerate requirements
pip freeze > requirements.txt

# Test
python manage.py check
```

#### 1.2 Frontend Node Dependencies
```powershell
cd C:\EasyCart\frontend

# Update Next.js and dependencies
npm audit fix --force

# If issues persist, manual update:
npm install next@latest

# Test build
npm run build
```

#### 1.3 Mobile Dependencies
```powershell
cd C:\EasyCart\mobile

# Update ip package
npm audit fix

# Test
npm run build
```

#### 1.4 Backend Node Dependencies (if applicable)
```powershell
cd C:\EasyCart\backend

# Update jws, validator, body-parser
npm audit fix

# Review changes
npm audit
```

### Phase 2: Clean Up temp_requirements.txt
```powershell
# Remove or update temp_requirements.txt
# It appears to be outdated and contains vulnerabilities
# Option 1: Delete if not needed
Remove-Item C:\EasyCart\backend\temp_requirements.txt

# Option 2: Update if still needed
# Review and sync with main requirements.txt
```

### Phase 3: Verification
```powershell
# Run security audit across all projects
cd C:\EasyCart

# Backend
cd backend
pip check

# Frontend
cd ../frontend
npm audit

# Mobile
cd ../mobile
npm audit

# Admin Dashboard
cd ../admin-dashboard
npm audit
```

---

## 🔄 Credential Rotation Checklist

### Credentials That Were Exposed
Based on the removed files (`.env.backup`, `.env.minimal`) and sanitized examples, the following credentials were potentially exposed in git history:

#### Critical - Rotate Immediately

- [ ] **Django SECRET_KEY**
  - **Where:** Backend settings
  - **How to rotate:**
    ```powershell
    python -c "import secrets; print(secrets.token_urlsafe(50))"
    ```
  - **Update in:**
    - `backend/.env`
    - Render.com environment variables
    - Any other deployment platforms

- [ ] **Database Credentials**
  - **Where:** PostgreSQL connection string
  - **What to rotate:**
    - Database password
    - Update `DB_PASSWORD` in `backend/.env`
    - Update password in PostgreSQL server
  - **Update in:**
    - Local `.env`
    - Render.com database settings
    - Any backup scripts

- [ ] **Cloudinary Credentials**
  - **Where:** Image hosting service
  - **How to rotate:**
    1. Log in to https://cloudinary.com/console
    2. Go to Settings → Security
    3. Click "Regenerate API Secret"
    4. Update `CLOUDINARY_URL` with new secret
  - **Update in:**
    - `backend/.env`
    - Render.com environment variables

#### High Priority - Rotate Within 48 Hours

- [ ] **M-Pesa API Credentials**
  - **Where:** Payment gateway
  - **How to rotate:**
    1. Log in to https://developer.safaricom.co.ke
    2. Regenerate Consumer Key and Consumer Secret
    3. Update in environment files
  - **Update in:**
    - `backend/.env`: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`
    - Render.com environment variables

- [ ] **Twilio Credentials**
  - **Where:** SMS/WhatsApp service
  - **How to rotate:**
    1. Log in to https://console.twilio.com
    2. Go to Account → General Settings
    3. Reset Auth Token (will invalidate old one)
    4. Update in environment files
  - **Update in:**
    - `backend/.env`: `TWILIO_AUTH_TOKEN`
    - Render.com environment variables

- [ ] **MPESA_WEBHOOK_SECRET**
  - **How to rotate:**
    ```powershell
    python -c "import secrets; print(secrets.token_hex(32))"
    ```
  - **Update in:**
    - `backend/.env`
    - Render.com environment variables

#### Medium Priority - Rotate Within 1 Week

- [ ] **JWT_SECRET** (if used)
  - **Note:** This will invalidate all existing user sessions
  - **How to rotate:**
    ```powershell
    python -c "import secrets; print(secrets.token_urlsafe(64))"
    ```
  - **Update in:**
    - `backend/.env`
    - Render.com environment variables
  - **Impact:** All users will need to re-login

- [ ] **Email Credentials** (if configured)
  - **Where:** SMTP settings for order notifications
  - **How to rotate:**
    - For Gmail: Generate new App Password
    - For other providers: Reset password
  - **Update in:**
    - `backend/.env`: `EMAIL_HOST_PASSWORD`
    - Render.com environment variables

#### Optional - Consider Rotating

- [ ] **Sentry DSN** (if configured)
  - **Where:** Error monitoring service
  - **How to rotate:**
    1. Log in to Sentry
    2. Project Settings → Client Keys (DSN)
    3. Create new key or regenerate
  - **Update in:**
    - `backend/.env`: `SENTRY_DSN`
    - Render.com environment variables

---

## 🔐 GPG Commit Signing Setup

### Prerequisites Check
```powershell
# Check if GPG is installed
gpg --version

# If not installed, install via Chocolatey:
choco install gpg4win
# Or download from: https://gnupg.org/download/
```

### Step 1: Generate GPG Key
```powershell
# Generate new GPG key
gpg --full-generate-key

# Follow prompts:
# - Key type: (1) RSA and RSA (default)
# - Key size: 4096
# - Expiration: 1y (or as preferred)
# - Real name: Your Name
# - Email: your-github-email@example.com (must match GitHub)
# - Passphrase: Create strong passphrase
```

### Step 2: Get GPG Key ID
```powershell
# List GPG keys
gpg --list-secret-keys --keyid-format=long

# Output will look like:
# sec   rsa4096/ABCD1234EFGH5678 2025-12-24 [SC] [expires: 2026-12-24]
#       Key ID is: ABCD1234EFGH5678

# Export public key
gpg --armor --export ABCD1234EFGH5678

# Copy the output (including BEGIN and END lines)
```

### Step 3: Add GPG Key to GitHub
```powershell
# 1. Go to: https://github.com/settings/keys
# 2. Click "New GPG key"
# 3. Paste the public key
# 4. Click "Add GPG key"
```

### Step 4: Configure Git to Use GPG
```powershell
# Set GPG key for signing
git config --global user.signingkey ABCD1234EFGH5678

# Enable commit signing by default
git config --global commit.gpgsign true

# Enable tag signing by default
git config --global tag.gpgsign true

# Set GPG program (Windows)
git config --global gpg.program "C:\Program Files (x86)\GnuPG\bin\gpg.exe"
# Or if using gpg4win:
# git config --global gpg.program "C:\Program Files (x86)\Gpg4win\bin\gpg.exe"
```

### Step 5: Test Signing
```powershell
cd C:\EasyCart

# Make a test commit
git commit --allow-empty -m "test: GPG signing setup"

# Verify signature
git log --show-signature -1

# Should show "Good signature from..."
```

### Step 6: Configure GPG Agent (Windows)
Create or edit `~/.gnupg/gpg-agent.conf`:
```
default-cache-ttl 3600
max-cache-ttl 86400
```

Restart GPG agent:
```powershell
gpg-connect-agent reloadagent /bye
```

### Troubleshooting GPG Signing

#### Issue: "gpg failed to sign the data"
```powershell
# Solution 1: Test GPG
echo "test" | gpg --clearsign

# Solution 2: Check GPG agent
gpg-connect-agent /bye

# Solution 3: Set GPG_TTY (add to PowerShell profile)
$env:GPG_TTY = $(tty)

# Solution 4: Restart GPG agent
gpgconf --kill gpg-agent
gpgconf --launch gpg-agent
```

#### Issue: "No secret key"
```powershell
# Verify key exists
gpg --list-secret-keys --keyid-format=long

# Ensure git config matches
git config --global user.signingkey
```

---

## 📋 Post-Rotation Verification

### After Rotating Credentials

- [ ] Backend health check passes: `https://easycart-backend.onrender.com/api/health/`
- [ ] Frontend connects to backend successfully
- [ ] Cloudinary image uploads work
- [ ] M-Pesa payment flow works (if applicable)
- [ ] SMS/WhatsApp notifications work (if applicable)
- [ ] Email notifications work (if applicable)
- [ ] Admin dashboard authentication works
- [ ] No 401/403 errors in logs
- [ ] All CI/CD pipelines pass

### Monitoring

```powershell
# Check Render logs for errors
# Visit: https://dashboard.render.com

# Check backend health
curl https://easycart-backend.onrender.com/api/health/

# Check frontend
curl https://easycart-frontend.onrender.com/
```

---

## 🚀 Deployment Steps

### After Fixing Vulnerabilities and Rotating Credentials

1. **Commit Changes**
```powershell
cd C:\EasyCart
git add .
git commit -S -m "security: fix Dependabot vulnerabilities and rotate credentials"
```

2. **Push to GitHub**
```powershell
git push origin main
```

3. **Update Render Environment Variables**
- Go to https://dashboard.render.com
- Select backend service
- Update all rotated credentials in Environment tab
- Service will auto-redeploy

4. **Verify Deployment**
- Monitor build logs
- Check health endpoint
- Test critical functionality

---

## 📝 Notes

- **History Rewrite Complete:** Secrets have been purged from git history
- **Django Pin Fixed:** Updated from 6.0 to 5.2.9 for Python 3.11 compatibility
- **Node.js Updated:** Upgraded from v18 (EOL) to v20 (LTS)
- **Branch Protection:** Consider re-enabling after security fixes are complete
- **Commit Signing:** Now required - all commits must be GPG signed

---

## ✅ Completion Checklist

### Immediate (Today)
- [ ] Update all high-priority npm packages
- [ ] Update urllib3 in backend
- [ ] Test builds locally
- [ ] Rotate Django SECRET_KEY
- [ ] Rotate Database password
- [ ] Rotate Cloudinary credentials

### Short Term (This Week)
- [ ] Rotate M-Pesa credentials
- [ ] Rotate Twilio credentials
- [ ] Rotate webhook secrets
- [ ] Set up GPG commit signing
- [ ] Test all rotated credentials
- [ ] Deploy to Render
- [ ] Verify production functionality

### Medium Term (Next Week)
- [ ] Review and update branch protection rules
- [ ] Document credential rotation process
- [ ] Set up automated security scanning
- [ ] Create runbook for future security incidents
- [ ] Consider implementing secrets management service (e.g., HashiCorp Vault, AWS Secrets Manager)

---

**Last Updated:** December 24, 2025
**Next Review:** After Phase 1 completion
