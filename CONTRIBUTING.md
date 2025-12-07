# Contributing to EasyCart

## Development Setup

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 14+
- Git

### Initial Setup

1. **Clone the repository**
```bash
git clone https://github.com/Bryvn01/EasyCart.git
cd EasyCart
```

2. **Backend Setup**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **Environment Variables**
Create `.env` files in backend and frontend directories (see `.env.example`)

## Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write clean, documented code
- Follow existing code style
- Add tests for new features

### 3. Run Tests Locally
```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm test
```

### 4. Commit Changes
```bash
git add .
git commit -m "feat: add new feature"
```

**Commit Message Format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Standards

### Python (Backend)
- Follow PEP 8
- Use type hints
- Write docstrings
- Max line length: 120

### JavaScript (Frontend)
- Use ES6+ features
- Follow Airbnb style guide
- Use functional components
- PropTypes for all components

## Testing Requirements

### Backend Tests
- Unit tests for models
- Integration tests for APIs
- Minimum 80% coverage

### Frontend Tests
- Component tests
- Integration tests
- Accessibility tests

## Pull Request Process

1. ✅ All tests pass
2. ✅ Code is linted
3. ✅ Documentation updated
4. ✅ No merge conflicts
5. ✅ Approved by 1 reviewer

## Questions?

Open an issue or contact the maintainers.
