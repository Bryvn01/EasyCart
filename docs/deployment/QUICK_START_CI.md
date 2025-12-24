# ✅ Quick Start: Enforce Required Tests

## TL;DR - Make Tests Required (3 Steps)

### 1. Enable Branch Protection (2 minutes)

**Go to:** https://github.com/Bryvn01/EasyCart/settings/branches

1. Click **Add rule** or **Edit** existing `main` rule
2. Check these boxes:
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require branches to be up to date before merging**
   - ✅ Select: **`test-and-build`** (this is your CI job name)
   - ✅ **Require a pull request before merging**
   - ✅ **Require approvals: 1**
   - ✅ **Do not allow bypassing**
3. **Save changes**

### 2. Install Pre-commit Hooks (1 minute)

Everyone on your team runs this **once**:

```powershell
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Test it
pre-commit run --all-files
```

### 3. Done! 🎉

From now on:
- ❌ Can't merge PRs with failing tests
- ❌ Can't push bad code (pre-commit stops you)
- ✅ All code must pass CI checks

---

## 🚀 What You Already Have

Your repo already has:

✅ **GitHub Actions CI** (`.github/workflows/required-checks.yml`)
  - Runs backend tests (Django)
  - Runs frontend tests (Jest)
  - Runs on every push/PR

✅ **Pre-commit Config** (`.pre-commit-config.yaml`)
  - Black (Python formatter)
  - Flake8 (Python linter)
  - ESLint (JavaScript linter)

✅ **Dependabot** (`.github/dependabot.yml`)
  - Auto-updates dependencies weekly

✅ **CODEOWNERS** (`.github/CODEOWNERS`)
  - Auto-assigns @Bryvn01 for reviews

---

## 📋 Developer Workflow

### Every commit:

```bash
# 1. Make changes
git add .

# 2. Commit (pre-commit runs automatically)
git commit -m "feat: add feature"
# ✅ Checks: formatting, linting, YAML, JSON

# 3. Push
git push

# 4. CI runs automatically
# ✅ Backend tests
# ✅ Frontend tests
# ✅ Build checks
```

### Creating a PR:

```bash
# 1. Create branch
git checkout -b feat/awesome-feature

# 2. Make changes + commit
git add . && git commit -m "feat: awesome feature"

# 3. Push
git push origin feat/awesome-feature

# 4. Open PR on GitHub
# 5. Wait for CI ✅
# 6. Get approval ✅
# 7. Merge (only if all checks pass)
```

---

## 🔧 Commands

### Run Tests Locally

```powershell
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm test -- --watchAll=false

# Both
cd backend && python manage.py test && cd ../frontend && npm test -- --watchAll=false
```

### Run Pre-commit Manually

```bash
# All files
pre-commit run --all-files

# Specific hook
pre-commit run black --all-files
pre-commit run flake8 --all-files
pre-commit run eslint --all-files
```

### Skip Pre-commit (Emergency)

```bash
git commit --no-verify -m "Emergency fix"
```

---

## 🛡️ Branch Protection Settings

**What gets blocked:**
- ❌ Merging PRs with failing tests
- ❌ Merging PRs without approval
- ❌ Pushing directly to `main`
- ❌ Merging outdated branches

**What's allowed:**
- ✅ Merging PRs that pass all checks
- ✅ Merging with 1+ approvals
- ✅ Force-push to feature branches (not `main`)

---

## 📊 View CI Results

- **Actions Tab**: https://github.com/Bryvn01/EasyCart/actions
- **PR Checks**: Automatically shown on every PR
- **Status Badge**: Add to README.md

```markdown
![CI](https://github.com/Bryvn01/EasyCart/actions/workflows/required-checks.yml/badge.svg)
```

---

## 🚨 Troubleshooting

### Pre-commit fails

```bash
# See errors
pre-commit run --all-files

# Auto-fix
cd backend && black .
cd frontend && npm run lint:fix

# Retry
git add . && git commit -m "fix: formatting"
```

### CI fails but local passes

- Check Python version: `python --version` (should be 3.12+)
- Check Node version: `node --version` (should be 18+)
- Clear caches: `npm cache clean --force`, `pip cache purge`

### Can't merge PR

- Check all CI checks passed ✅
- Check you have 1 approval ✅
- Check branch is up-to-date ✅

---

## ✅ Verification Checklist

After setup:

- [ ] Branch protection enabled on `main`
- [ ] Pre-commit hooks installed (`pre-commit run --all-files`)
- [ ] Create test PR and verify CI runs
- [ ] Verify can't merge PR without passing checks
- [ ] Verify can't push directly to `main`

---

## 🎯 Summary

**Before (❌):**
- Tests were optional
- Bad code could be merged
- No automatic checks

**After (✅):**
- Tests are **required**
- CI blocks failing PRs
- Pre-commit catches errors locally
- All code must pass checks before merge

---

**Questions?** See `CONTRIBUTING.md` for detailed guide.
