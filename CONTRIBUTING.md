# Contributing to EasyCart

Thank you for your interest in contributing to EasyCart! This document provides guidelines and best practices for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 🤝 Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 16+
- PostgreSQL 13+
- Git

### Setting Up Your Development Environment

1. **Fork the repository**
   ```bash
   # Fork via GitHub UI, then clone your fork
   git clone https://github.com/YOUR_USERNAME/EasyCart.git
   cd EasyCart
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Bryvn01/EasyCart.git
   ```

3. **Set up backend**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your settings
   python manage.py migrate
   python manage.py seed_products
   python manage.py createsuperuser
   ```

4. **Set up frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   ```

5. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   python manage.py runserver

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## 🔧 How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check existing issues to avoid duplicates
2. Collect information about the bug
3. Use the bug report template

Include in your bug report:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, versions)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When suggesting:
1. Use a clear and descriptive title
2. Provide detailed description of the proposed feature
3. Explain why this enhancement would be useful
4. List similar features in other applications if applicable

### Your First Code Contribution

Unsure where to start? Look for issues labeled:
- `good-first-issue` - Good for newcomers
- `help-wanted` - Need community assistance
- `documentation` - Documentation improvements

## 🔄 Pull Request Process

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-description
```

**Branch Naming Convention:**
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Urgent production fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

### 2. Make Your Changes

- Write clean, readable code
- Follow coding standards (see below)
- Add tests for new functionality
- Update documentation as needed
- Commit messages should be clear and descriptive

**Commit Message Format:**
```
type(scope): brief description

Detailed description of what changed and why

Closes #issue_number
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples:**
```
feat(products): add product filtering by category

Implemented category filter dropdown in product list page.
Users can now filter products by selecting categories.

Closes #123
```

```
fix(auth): resolve JWT token expiration issue

Fixed bug where JWT tokens were not refreshing properly,
causing users to be logged out prematurely.

Closes #456
```

### 3. Test Your Changes

```bash
# Backend tests
cd backend
pytest
python manage.py test

# Frontend tests
cd frontend
npm test
npm run lint

# Integration tests
npm run test:integration
```

### 4. Update Documentation

- Update README.md if needed
- Add inline code comments for complex logic
- Update API documentation for endpoint changes
- Add to CHANGELOG.md (if it exists)

### 5. Submit Pull Request

1. **Update your branch with latest changes**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request on GitHub**
   - Use the PR template
   - Fill out all required sections
   - Link related issues
   - Add appropriate labels

4. **Address Review Feedback**
   - Respond to comments
   - Make requested changes
   - Push updates to your branch
   - Request re-review when ready

### PR Review Process

Your PR will be reviewed based on:
1. **Functionality** - Does it work as intended?
2. **Code Quality** - Is it clean, readable, maintainable?
3. **Tests** - Are there adequate tests?
4. **Documentation** - Is it well-documented?
5. **Performance** - Does it perform well?
6. **Security** - Are there security concerns?

**Review Timeline:**
- Critical PRs: Same day
- High priority: 1-2 days
- Medium priority: 3-5 days
- Low priority: 1-2 weeks

See [PR Management Guidelines](docs/PR_MANAGEMENT_GUIDELINES.md) for details.

## 💻 Coding Standards

### Python (Backend)

**Style Guide:** PEP 8

```python
# Good
def calculate_total_price(items: list[dict]) -> float:
    """Calculate total price of items in cart.
    
    Args:
        items: List of item dictionaries with 'price' and 'quantity'
        
    Returns:
        Total price as float
    """
    return sum(item['price'] * item['quantity'] for item in items)

# Bad
def calc(i):
    t=0
    for x in i:
        t+=x['price']*x['quantity']
    return t
```

**Key Points:**
- Use descriptive variable names
- Add docstrings to functions/classes
- Type hints for function parameters
- Max line length: 100 characters
- Use f-strings for formatting
- Follow Django best practices

### JavaScript/React (Frontend)

**Style Guide:** Airbnb JavaScript Style Guide

```javascript
// Good
const ProductCard = ({ product, onAddToCart }) => {
  const handleAddToCart = () => {
    onAddToCart(product.id);
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
};

// Bad
function ProductCard(props) {
  return <div><h3>{props.product.name}</h3><button onClick={()=>props.onAddToCart(props.product.id)}>Add to Cart</button></div>
}
```

**Key Points:**
- Use functional components with hooks
- PropTypes or TypeScript for type checking
- Destructure props
- Use meaningful component names
- Follow React best practices
- Use ESLint configuration

### Common Standards

- **DRY** - Don't Repeat Yourself
- **KISS** - Keep It Simple, Stupid
- **YAGNI** - You Aren't Gonna Need It
- **SOLID** - Follow SOLID principles
- Write self-documenting code
- Comment complex logic
- Use consistent naming conventions

## 🧪 Testing Guidelines

### Backend Testing

```python
# tests/test_products.py
from django.test import TestCase
from apps.products.models import Product

class ProductModelTest(TestCase):
    def setUp(self):
        self.product = Product.objects.create(
            name='Test Product',
            price=29.99,
            stock=10
        )
    
    def test_product_creation(self):
        self.assertEqual(self.product.name, 'Test Product')
        self.assertEqual(self.product.price, 29.99)
    
    def test_product_str(self):
        self.assertEqual(str(self.product), 'Test Product')
```

### Frontend Testing

```javascript
// ProductCard.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 29.99
  };
  
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
  
  it('calls onAddToCart when button clicked', () => {
    const mockOnAddToCart = jest.fn();
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
      />
    );
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockOnAddToCart).toHaveBeenCalledWith(1);
  });
});
```

### Testing Best Practices

- Write tests before or alongside code (TDD encouraged)
- Test edge cases and error conditions
- Aim for >80% code coverage
- Keep tests focused and independent
- Use descriptive test names
- Mock external dependencies
- Test user interactions, not implementation

## 📚 Documentation

### Code Comments

```python
# Good - Explains WHY
# Calculate discount based on customer loyalty tier
# Premium customers get 20% off, regular get 10%
discount = 0.20 if customer.is_premium else 0.10

# Bad - Explains WHAT (obvious from code)
# Set discount to 0.20 or 0.10
discount = 0.20 if customer.is_premium else 0.10
```

### API Documentation

When adding/modifying API endpoints:

```python
class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing products.
    
    list: Return paginated list of products
    create: Create a new product (admin only)
    retrieve: Get specific product details
    update: Update product (admin only)
    destroy: Delete product (admin only)
    
    Filtering:
    - category: Filter by category ID
    - price_min: Minimum price
    - price_max: Maximum price
    - search: Search by name or description
    """
```

### README Updates

Update relevant README sections when:
- Adding new features
- Changing setup procedures
- Modifying API endpoints
- Updating dependencies
- Changing configuration

## 🔒 Security

- **Never commit secrets** - Use environment variables
- **Validate all inputs** - Prevent injection attacks
- **Use parameterized queries** - Prevent SQL injection
- **Sanitize user content** - Prevent XSS
- **Keep dependencies updated** - Patch vulnerabilities
- **Report security issues privately** - See SECURITY.md

## ❓ Questions?

- **General questions:** Open a discussion on GitHub
- **Bug reports:** Create an issue using bug template
- **Feature requests:** Create an issue using feature template
- **Security concerns:** See SECURITY.md

## 📝 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## 🙏 Thank You!

Thank you for contributing to EasyCart! Your efforts help make this project better for everyone.

---

**Resources:**
- [PR Management Guidelines](docs/PR_MANAGEMENT_GUIDELINES.md)
- [PR Quick Reference](docs/PR_QUICK_REFERENCE.md)
- [Security Policy](SECURITY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
