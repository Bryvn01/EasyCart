# Contributing to EasyCart

Thank you for your interest in contributing to EasyCart! This document provides guidelines and instructions for contributing.

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 14+
- Git

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Bryvn01/EasyCart.git
   cd EasyCart
   ```

2. **Backend setup**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py seed_products
   python manage.py runserver
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Run All Tests
```bash
# Backend
cd backend && python manage.py test

# Frontend
cd frontend && npm test -- --watchAll=false
```

## 🔍 Code Quality

### Pre-commit Hooks

Install pre-commit hooks to catch issues before committing:

```bash
pip install pre-commit
pre-commit install
```

This will automatically run:
- Trailing whitespace removal
- End-of-file fixer
- YAML/JSON validation
- Black (Python formatter)
- Flake8 (Python linter)
- ESLint (JavaScript linter)

### Manual Linting

**Backend:**
```bash
cd backend
flake8 .
black . --check
```

**Frontend:**
```bash
cd frontend
npm run lint
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(cart): add debounced add-to-cart button"
git commit -m "fix(api): resolve products.filter TypeError"
git commit -m "docs: update README with deployment instructions"
```

## 🌿 Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feat/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

**Workflow:**
1. Create a branch from `develop`
2. Make your changes
3. Run tests locally
4. Push and create a Pull Request
5. Wait for CI checks to pass
6. Request review

## 🔄 Pull Request Process

1. **Create a descriptive PR title**
   ```
   feat: Add mobile-optimized product cards
   ```

2. **Fill out the PR template**
   - Describe what changed
   - Link related issues
   - Add screenshots if UI changes
   - List breaking changes

3. **Ensure CI passes**
   - All tests must pass
   - No linting errors
   - Build succeeds

4. **Request review**
   - Tag relevant reviewers
   - Respond to feedback
   - Make requested changes

5. **Merge**
   - Squash and merge (preferred)
   - Delete branch after merge

## ✅ CI/CD Checks

All PRs must pass these checks:

- ✅ Backend tests
- ✅ Frontend tests
- ✅ Linting (backend & frontend)
- ✅ Build succeeds
- ✅ No security vulnerabilities

## 🐛 Reporting Bugs

Use the [GitHub Issues](https://github.com/Bryvn01/EasyCart/issues) page.

**Include:**
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs
- Environment details

## 💡 Suggesting Features

Open a [Feature Request](https://github.com/Bryvn01/EasyCart/issues/new) with:
- Use case description
- Proposed solution
- Alternative solutions considered
- Additional context

## 📚 Documentation

- Update README.md for user-facing changes
- Add docstrings to new functions/classes
- Update API documentation
- Add comments for complex logic

## 🔒 Security

- Never commit secrets or credentials
- Use environment variables
- Report security issues privately to the maintainers
- Follow OWASP guidelines

## 📞 Getting Help

- Check existing issues
- Read the documentation
- Ask in discussions
- Contact maintainers

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to EasyCart! 🎉
