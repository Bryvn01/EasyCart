# 🔐 GPG Commit Signing Setup Guide - EasyCart

**Generated:** December 24, 2025
**Status:** Manual Installation Required

---

## ⚠️ Installation Required

GPG is not currently installed on your system. You'll need to install it manually with administrator privileges.

---

## 📥 Installation Options

### Option 1: GPG4Win (Recommended for Windows)

**Download:** https://gpg4win.org/download.html

**Steps:**
1. Download the latest version (Gpg4win-4.x.x.exe)
2. **Right-click** → **Run as Administrator**
3. Follow installation wizard
4. Default settings are fine
5. Restart your terminal after installation

**Installation Path:** `C:\Program Files (x86)\Gpg4win\bin\gpg.exe`

---

### Option 2: Git for Windows (If you have Git installed)

Git for Windows includes GPG. Check if it's available:

```powershell
& "C:\Program Files\Git\usr\bin\gpg.exe" --version
```

If available, use this path in git config.

---

### Option 3: Chocolatey (Requires Admin PowerShell)

1. **Open PowerShell as Administrator**
2. Run:
```powershell
choco install gpg4win -y
```

---

## 🔧 Post-Installation Setup

### Step 1: Verify Installation

```powershell
# After installation, restart your terminal and run:
gpg --version

# Should output:
# gpg (GnuPG) 2.x.x
# libgcrypt x.x.x
```

---

### Step 2: Generate GPG Key

```powershell
# Generate new GPG key
gpg --full-generate-key
```

**Follow the prompts:**

1. **Key type:** Press Enter (RSA and RSA is default)
2. **Key size:** Type `4096` and press Enter
3. **Expiration:** Type `1y` (1 year) or `0` (never expire) and press Enter
4. **Real name:** Your full name (e.g., "Bryvn Easycart")
5. **Email:** Your GitHub email (MUST match your GitHub account)
6. **Comment:** Optional (can leave blank)
7. **Passphrase:** Create a strong passphrase (you'll need this for every signed commit)

**Example:**
```
Real name: Bryvn Easycart
Email address: your-github-email@example.com
Comment:
You selected this USER-ID:
    "Bryvn Easycart <your-github-email@example.com>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
```

---

### Step 3: List Your GPG Keys

```powershell
gpg --list-secret-keys --keyid-format=long
```

**Output will look like:**
```
sec   rsa4096/3AA5C34371567BD2 2025-12-24 [SC] [expires: 2026-12-24]
      D5E4F29691E834CCDDC06E753AA5C34371567BD2
uid                 [ultimate] Bryvn Easycart <your-github-email@example.com>
ssb   rsa4096/B5690EEEBB952194 2025-12-24 [E] [expires: 2026-12-24]
```

**Your GPG Key ID is:** `3AA5C34371567BD2` (the part after `rsa4096/`)

---

### Step 4: Export Public Key

```powershell
# Replace YOUR_KEY_ID with your actual key ID from Step 3
gpg --armor --export YOUR_KEY_ID

# Example:
# gpg --armor --export 3AA5C34371567BD2
```

**Output will be:**
```
-----BEGIN PGP PUBLIC KEY BLOCK-----

mQINBGb...
...many lines of base64 text...
...more base64 text...
=xyz
-----END PGP PUBLIC KEY BLOCK-----
```

**Copy the ENTIRE output** (including BEGIN and END lines)

---

### Step 5: Add GPG Key to GitHub

1. Go to: https://github.com/settings/keys
2. Click **"New GPG key"**
3. **Title:** "EasyCart Development Key" (or any descriptive name)
4. **Key:** Paste the entire public key block from Step 4
5. Click **"Add GPG key"**
6. Confirm with your GitHub password if prompted

---

### Step 6: Configure Git to Use GPG

```powershell
# Set your GPG key ID (replace with yours from Step 3)
git config --global user.signingkey YOUR_KEY_ID

# Example:
# git config --global user.signingkey 3AA5C34371567BD2

# Enable automatic commit signing
git config --global commit.gpgsign true

# Enable automatic tag signing
git config --global tag.gpgsign true

# Set GPG program path (choose the one that matches your installation)

# For GPG4Win:
git config --global gpg.program "C:\Program Files (x86)\Gpg4win\bin\gpg.exe"

# OR for Git for Windows:
# git config --global gpg.program "C:\Program Files\Git\usr\bin\gpg.exe"

# Verify email matches GitHub
git config --global user.email "your-github-email@example.com"
git config --global user.name "Your Name"
```

---

### Step 7: Configure GPG Agent

**Create or edit:** `%USERPROFILE%\.gnupg\gpg-agent.conf`

```powershell
# Create directory if it doesn't exist
mkdir "$env:USERPROFILE\.gnupg" -Force

# Create config file
@"
default-cache-ttl 3600
max-cache-ttl 86400
enable-ssh-support
"@ | Out-File -FilePath "$env:USERPROFILE\.gnupg\gpg-agent.conf" -Encoding ASCII
```

**Restart GPG agent:**
```powershell
gpg-connect-agent reloadagent /bye
```

---

### Step 8: Test Signing

```powershell
cd C:\EasyCart

# Create a test commit (no changes needed)
git commit --allow-empty -m "test: GPG signing setup"

# Should prompt for your GPG passphrase

# Verify the signature
git log --show-signature -1
```

**Expected output:**
```
gpg: Signature made ...
gpg: using RSA key ...
gpg: Good signature from "Your Name <your-email>"
commit abc123def456...
Author: Your Name <your-email>
Date:   ...

    test: GPG signing setup
```

---

## 🔍 Verification Checklist

- [ ] GPG installed and available in PATH
- [ ] GPG key generated with email matching GitHub
- [ ] Public key added to GitHub account
- [ ] Git configured with GPG key ID
- [ ] Git configured to auto-sign commits
- [ ] GPG agent configured for caching
- [ ] Test commit signed successfully
- [ ] GitHub shows "Verified" badge on test commit

---

## 🛠️ Troubleshooting

### Issue 1: "gpg failed to sign the data"

**Solution A: Test GPG directly**
```powershell
echo "test" | gpg --clearsign
```
If this fails, GPG is not properly configured.

**Solution B: Set GPG_TTY (for some terminals)**
```powershell
$env:GPG_TTY = $(tty)
# Add to your PowerShell profile to make permanent
```

**Solution C: Restart GPG agent**
```powershell
gpgconf --kill gpg-agent
gpgconf --launch gpg-agent
```

**Solution D: Check GPG program path**
```powershell
# Verify git knows where GPG is
git config --global gpg.program

# Test if the path works
& "C:\Program Files (x86)\Gpg4win\bin\gpg.exe" --version
```

---

### Issue 2: "No secret key"

**Check that key exists:**
```powershell
gpg --list-secret-keys --keyid-format=long
```

**Verify git config matches:**
```powershell
git config --global user.signingkey
```

Make sure the key ID matches!

---

### Issue 3: "Inappropriate ioctl for device"

**Solution: Set GPG_TTY**
```powershell
# Add to your PowerShell profile (~\Documents\PowerShell\Microsoft.PowerShell_profile.ps1)
$env:GPG_TTY = $(tty)
```

---

### Issue 4: GitHub Shows "Unverified" on Signed Commits

**Causes:**
1. Email in GPG key doesn't match GitHub email
2. Public key not added to GitHub
3. Email in git config doesn't match GPG key

**Solution:**
```powershell
# Check git email
git config --global user.email

# Check GPG key email
gpg --list-keys

# They MUST match and both MUST match your GitHub email
```

---

### Issue 5: Passphrase Prompt Not Showing

**For Windows:**
1. Install Gpg4win with Kleopatra (GUI)
2. In Kleopatra: Settings → GnuPG System → Private Keys
3. Enable "Use pinentry" for passphrase entry

**Or use command line:**
```powershell
# Configure pinentry
echo "pinentry-program C:\Program Files (x86)\Gpg4win\bin\pinentry.exe" | Out-File -Append "$env:USERPROFILE\.gnupg\gpg-agent.conf" -Encoding ASCII

# Restart agent
gpg-connect-agent reloadagent /bye
```

---

## 📝 Quick Reference

### View Your Public Key
```powershell
gpg --armor --export YOUR_KEY_ID
```

### Sign a Commit Manually
```powershell
git commit -S -m "commit message"
```

### Sign a Tag
```powershell
git tag -s v1.0.0 -m "Release v1.0.0"
```

### Verify a Commit
```powershell
git log --show-signature -1
```

### Disable Signing (temporarily)
```powershell
git commit --no-gpg-sign -m "commit message"
```

### Re-sign Last Commit
```powershell
git commit --amend --no-edit -S
```

---

## 🔒 Security Best Practices

### 1. Backup Your Private Key
```powershell
# Export private key (KEEP THIS SECURE!)
gpg --export-secret-keys --armor YOUR_KEY_ID > gpg-private-key-backup.asc

# Store in a secure location (password manager, encrypted USB, etc.)
# DO NOT commit to git or share publicly
```

### 2. Set Key Expiration
- Keys should expire (recommend 1-2 years)
- Extend expiration before it expires
- Revoke and replace if compromised

### 3. Use Strong Passphrase
- Minimum 20 characters
- Mix of letters, numbers, symbols
- Store in password manager
- Never share or commit to git

### 4. Revoke Compromised Keys
```powershell
# Generate revocation certificate
gpg --output revoke.asc --gen-revoke YOUR_KEY_ID

# If key is compromised, import and publish the revocation
gpg --import revoke.asc
gpg --keyserver keyserver.ubuntu.com --send-keys YOUR_KEY_ID
```

---

## 📋 Next Steps After Setup

1. **Test with a real commit:**
```powershell
cd C:\EasyCart
git add SECURITY_FIX_PLAN.md
git commit -S -m "docs: add security fix plan and GPG setup guide"
git push origin main
```

2. **Verify on GitHub:**
- Go to: https://github.com/Bryvn01/EasyCart/commits/main
- Your commit should show a green "Verified" badge

3. **Make signing permanent:**
All future commits will be automatically signed (because of `commit.gpgsign true`)

---

## ✅ Completion Checklist

- [ ] Download and install GPG4Win (as Administrator)
- [ ] Restart terminal
- [ ] Generate GPG key with GitHub email
- [ ] Export public key
- [ ] Add public key to GitHub
- [ ] Configure git with GPG key ID
- [ ] Enable auto-signing in git config
- [ ] Configure GPG agent
- [ ] Test with empty commit
- [ ] Verify "Good signature" in git log
- [ ] Check GitHub shows "Verified" badge
- [ ] Backup private key securely
- [ ] Document key ID and location

---

**Installation Link:** https://gpg4win.org/download.html

**GitHub GPG Keys:** https://github.com/settings/keys

**Documentation:** https://docs.github.com/en/authentication/managing-commit-signature-verification

---

**Last Updated:** December 24, 2025
**Next Review:** After GPG installation and first signed commit
