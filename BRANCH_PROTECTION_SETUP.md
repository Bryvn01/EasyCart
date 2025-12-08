# GitHub Branch Protection Setup Guide

## Step 1: Access Branch Protection Settings
1. Go to: https://github.com/Bryvn01/EasyCart/settings/branches
2. Click **"Add rule"** or edit existing rule for `main`

---

## Step 2: Branch Name Pattern
```
main
```

---

## Step 3: Protection Rules to Enable

### ✅ Require a pull request before merging
- [x] **Require approvals**: 1
- [x] **Dismiss stale pull request approvals when new commits are pushed**
- [x] **Require review from Code Owners** (optional)
- [ ] Require approval of the most recent reviewable push

### ✅ Require status checks to pass before merging
- [x] **Require branches to be up to date before merging**
- **Required status checks** (select these):
  - `test-and-build` (from Required Checks workflow)
  - `build-test-lint` (from CI-CD-Pipeline workflow)
  - `security-scan` (from Security Audit workflow)

### ✅ Require conversation resolution before merging
- [x] **All conversations on code must be resolved**

### ✅ Require signed commits
- [x] **Require signed commits** (recommended for security)

### ✅ Require linear history
- [x] **Require linear history** (prevents merge commits)

### ✅ Require deployments to succeed before merging
- [ ] Skip (optional - only if you have deployment environments)

### ✅ Lock branch
- [ ] **Do not lock** (allow pushes)

### ✅ Do not allow bypassing the above settings
- [x] **Do not allow bypassing the above settings**
- **Exceptions**: Add yourself (Bryvn01) for emergency fixes

### ✅ Restrict who can push to matching branches
- [ ] Skip (or add specific users/teams)

### ✅ Allow force pushes
- [ ] **Disabled** (prevent force pushes)

### ✅ Allow deletions
- [ ] **Disabled** (prevent branch deletion)

---

## Step 4: Additional Repository Settings

### General Settings
Go to: https://github.com/Bryvn01/EasyCart/settings

#### Features
- [x] **Wikis** (for documentation)
- [x] **Issues** (for bug tracking)
- [x] **Sponsorships** (GitHub Sponsors)
- [x] **Preserve this repository** (GitHub Archive Program)
- [x] **Discussions** (community forum)

#### Pull Requests
- [x] **Allow merge commits**
- [x] **Allow squash merging** (recommended)
- [x] **Allow rebase merging**
- [x] **Always suggest updating pull request branches**
- [x] **Allow auto-merge**
- [x] **Automatically delete head branches**

#### Archives
- [ ] **Do not include Git LFS objects in archives**

---

## Step 5: Code Security and Analysis
Go to: https://github.com/Bryvn01/EasyCart/settings/security_analysis

### Dependency Graph
- [x] **Dependency graph** (enabled by default)

### Dependabot
- [x] **Dependabot alerts** (security vulnerabilities)
- [x] **Dependabot security updates** (auto-fix vulnerabilities)
- [x] **Grouped security updates** (batch updates)

### Code Scanning
- [x] **CodeQL analysis** (already configured via workflow)

### Secret Scanning
- [x] **Secret scanning** (detect leaked credentials)
- [x] **Push protection** (block commits with secrets)

---

## Step 6: Collaborators and Teams
Go to: https://github.com/Bryvn01/EasyCart/settings/access

### Roles
- **Admin**: Bryvn01 (you)
- **Maintain**: Trusted contributors
- **Write**: Regular contributors
- **Triage**: Issue managers
- **Read**: Public (open source)

---

## Step 7: Webhooks and Notifications
Go to: https://github.com/Bryvn01/EasyCart/settings/hooks

### Recommended Webhooks
- **Slack/Discord**: For team notifications
- **CI/CD**: Already configured via GitHub Actions

---

## Step 8: GitHub Pages (Optional)
Go to: https://github.com/Bryvn01/EasyCart/settings/pages

- **Source**: Deploy from a branch
- **Branch**: `gh-pages` or `main`
- **Folder**: `/docs` or `/` (root)
- **Custom domain**: easycart.yourdomain.com

---

## Step 9: Environments (Deployment Protection)
Go to: https://github.com/Bryvn01/EasyCart/settings/environments

### Create Environments
1. **Production**
   - [x] Required reviewers: Bryvn01
   - [x] Wait timer: 5 minutes
   - [x] Deployment branches: `main` only

2. **Staging**
   - [x] Deployment branches: `develop`, `main`

3. **Development**
   - [ ] No restrictions

---

## Step 10: Repository Topics
Go to: https://github.com/Bryvn01/EasyCart

Add topics for discoverability:
```
ecommerce, django, react, postgresql, jwt, mpesa, twilio,
python, javascript, rest-api, full-stack, kenya, shopping-cart
```

---

## Step 11: About Section
Edit repository description:

**Description:**
```
🛒 Full-stack e-commerce platform with Django REST API, React frontend, PostgreSQL, JWT auth, M-Pesa payments, and Twilio notifications. Built for the Kenyan market.
```

**Website:**
```
https://easycart-frontend-wj9x.onrender.com
```

**Tags:** (see Step 10)

---

## Step 12: README Badges
Already added in README.md:
- ✅ CI/CD Pipeline status
- ✅ Required Checks status
- ✅ License badge
- ✅ Python version
- ✅ Django version
- ✅ React version

---

## Step 13: Issue Templates
Create: `.github/ISSUE_TEMPLATE/`

### Bug Report Template
```yaml
name: Bug Report
about: Report a bug or issue
title: '[BUG] '
labels: bug
assignees: Bryvn01
```

### Feature Request Template
```yaml
name: Feature Request
about: Suggest a new feature
title: '[FEATURE] '
labels: enhancement
assignees: Bryvn01
```

---

## Step 14: Pull Request Template
Create: `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## Description
<!-- Describe your changes -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No new warnings
```

---

## Step 15: CODEOWNERS File
Create: `.github/CODEOWNERS`

```
# Default owner for everything
* @Bryvn01

# Backend code
/backend/ @Bryvn01

# Frontend code
/frontend/ @Bryvn01
/admin-dashboard/ @Bryvn01

# CI/CD workflows
/.github/ @Bryvn01

# Documentation
*.md @Bryvn01
```

---

## Quick Setup Checklist

- [ ] Branch protection rule for `main`
- [ ] Required status checks enabled
- [ ] Dependabot alerts enabled
- [ ] Secret scanning enabled
- [ ] Code owners file created
- [ ] Issue templates created
- [ ] PR template created
- [ ] Repository topics added
- [ ] About section updated
- [ ] Signed commits required
- [ ] Linear history enforced
- [ ] Auto-delete branches enabled
- [ ] Deployment environments configured

---

## Verification

After setup, test by:
1. Creating a new branch
2. Making a change
3. Opening a PR
4. Verify status checks run
5. Verify approval required
6. Merge and verify auto-delete

---

**Setup Time**: ~15 minutes
**Security Level**: Enterprise-grade
**Maintenance**: Automated via Dependabot
