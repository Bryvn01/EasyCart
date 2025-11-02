# Code Style Guide

## 🎯 Overview

This document defines coding standards and style conventions for the EasyCart project. Consistent code style improves readability, maintainability, and collaboration.

## 📚 Table of Contents

- [Python (Backend)](#python-backend)
- [JavaScript/React (Frontend)](#javascriptreact-frontend)
- [CSS/Styling](#cssstyling)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Comments and Documentation](#comments-and-documentation)
- [Git Commit Messages](#git-commit-messages)

## 🐍 Python (Backend)

### Style Guide
Follow **PEP 8** with these specific conventions:

### General Rules
- **Line Length**: Maximum 100 characters
- **Indentation**: 4 spaces (no tabs)
- **Quotes**: Use single quotes for strings, double quotes for docstrings
- **Imports**: Group and order as: standard library, third-party, local

### Example Structure
```python
# Standard library imports
import os
from typing import Optional, List, Dict

# Third-party imports
from django.db import models
from rest_framework import serializers

# Local application imports
from apps.products.models import Product


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model.
    
    Provides comprehensive product data including pricing,
    inventory, and category information.
    """
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_in_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock',
            'category', 'category_name', 'is_in_stock', 'image_url'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_is_in_stock(self, obj: Product) -> bool:
        """Check if product has available stock."""
        return obj.stock > 0
    
    def validate_price(self, value: float) -> float:
        """Ensure price is positive."""
        if value < 0:
            raise serializers.ValidationError('Price cannot be negative')
        return value
```

### Naming Conventions

#### Variables and Functions
```python
# Good
user_count = 10
total_price = calculate_total_price(items)

def get_active_users():
    """Retrieve all active users."""
    pass

# Bad
userCount = 10  # Use snake_case, not camelCase
TotalPrice = calculate_total_price(items)  # Don't capitalize variables

def GetActiveUsers():  # Function names should be snake_case
    pass
```

#### Classes
```python
# Good
class UserProfile(models.Model):
    pass

class ProductSerializer(serializers.ModelSerializer):
    pass

# Bad
class user_profile(models.Model):  # Should be PascalCase
    pass
```

#### Constants
```python
# Good
MAX_RETRY_COUNT = 3
DEFAULT_PAGE_SIZE = 20
API_VERSION = '1.0'

# Bad
max_retry_count = 3  # Constants should be UPPER_CASE
```

### Type Hints
Always use type hints for function parameters and return values:

```python
# Good
def calculate_discount(
    price: float,
    discount_percentage: int,
    is_premium: bool = False
) -> float:
    """Calculate discounted price."""
    discount = price * (discount_percentage / 100)
    if is_premium:
        discount *= 1.5
    return price - discount

# Bad
def calculate_discount(price, discount_percentage, is_premium=False):
    """Calculate discounted price."""
    discount = price * (discount_percentage / 100)
    if is_premium:
        discount *= 1.5
    return price - discount
```

### Docstrings
Use Google-style docstrings:

```python
def process_payment(
    amount: float,
    payment_method: str,
    user_id: int
) -> Dict[str, any]:
    """Process payment transaction.
    
    Args:
        amount: Payment amount in local currency
        payment_method: Payment method (mpesa, card, etc.)
        user_id: ID of the user making payment
        
    Returns:
        Dictionary containing transaction status and details:
        {
            'success': bool,
            'transaction_id': str,
            'message': str
        }
        
    Raises:
        PaymentError: If payment processing fails
        ValueError: If amount is invalid
        
    Example:
        >>> result = process_payment(1000.0, 'mpesa', 123)
        >>> result['success']
        True
    """
    pass
```

### Error Handling
```python
# Good - Specific exceptions
try:
    user = User.objects.get(id=user_id)
except User.DoesNotExist:
    raise Http404('User not found')
except ValidationError as e:
    return Response({'error': str(e)}, status=400)

# Bad - Generic exceptions
try:
    user = User.objects.get(id=user_id)
except Exception as e:  # Too broad
    pass
```

### Django Best Practices

#### Models
```python
class Product(models.Model):
    """Product model representing items in catalog."""
    
    name = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name', 'created_at']),
        ]
    
    def __str__(self) -> str:
        return self.name
    
    def is_available(self) -> bool:
        """Check if product is available for purchase."""
        return self.stock > 0
```

#### Views
```python
class ProductViewSet(viewsets.ModelViewSet):
    """API endpoint for product management."""
    
    queryset = Product.objects.select_related('category')
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']
    
    def get_queryset(self):
        """Filter queryset based on query parameters."""
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        return queryset
```

## ⚛️ JavaScript/React (Frontend)

### Style Guide
Follow **Airbnb JavaScript Style Guide** with React-specific conventions:

### General Rules
- **Line Length**: Maximum 100 characters
- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes for strings, backticks for templates
- **Semicolons**: Required at end of statements
- **Trailing Commas**: Required in multi-line arrays/objects

### React Component Structure
```javascript
// Imports grouped and ordered
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// Local imports
import { api } from '../services/api';
import Button from '../components/Button';
import './ProductCard.css';

/**
 * ProductCard component displays product information in a card format.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.product - Product object with id, name, price, etc.
 * @param {Function} props.onAddToCart - Callback when add to cart is clicked
 * @param {boolean} props.showActions - Whether to show action buttons
 * @returns {JSX.Element} Product card component
 */
const ProductCard = ({ product, onAddToCart, showActions = true }) => {
  // State declarations
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Hooks
  const navigate = useNavigate();
  
  // Effects
  useEffect(() => {
    // Cleanup function
    return () => {
      // Cleanup code
    };
  }, [product.id]);
  
  // Event handlers
  const handleAddToCart = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onAddToCart(product.id);
    } catch (err) {
      setError('Failed to add to cart');
      console.error('Add to cart error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewDetails = () => {
    navigate(`/products/${product.id}`);
  };
  
  // Early return for loading/error states
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  // Main render
  return (
    <div className="product-card">
      <img 
        src={product.image_url} 
        alt={product.name}
        className="product-image"
      />
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">KES {product.price.toFixed(2)}</p>
        
        {showActions && (
          <div className="product-actions">
            <Button 
              onClick={handleAddToCart}
              disabled={isLoading || !product.is_in_stock}
              variant="primary"
            >
              {isLoading ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button 
              onClick={handleViewDetails}
              variant="secondary"
            >
              View Details
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// PropTypes
ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image_url: PropTypes.string,
    is_in_stock: PropTypes.bool,
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
  showActions: PropTypes.bool,
};

export default ProductCard;
```

### Naming Conventions

#### Components
```javascript
// Good - PascalCase for components
const ProductCard = () => { };
const UserProfile = () => { };

// Bad
const productCard = () => { };  // Should be PascalCase
const user_profile = () => { };  // Use PascalCase, not snake_case
```

#### Variables and Functions
```javascript
// Good - camelCase for variables and functions
const userName = 'John';
const totalPrice = 100;

const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// Bad
const UserName = 'John';  // Variables should be camelCase
const total_price = 100;  // Use camelCase, not snake_case
```

#### Constants
```javascript
// Good - UPPER_CASE for constants
const MAX_ITEMS_PER_PAGE = 20;
const API_BASE_URL = 'https://api.example.com';

// Bad
const maxItemsPerPage = 20;  // Constants should be UPPER_CASE
```

#### File Names
```javascript
// Components - PascalCase
ProductCard.jsx
UserProfile.jsx

// Utilities - camelCase
apiClient.js
formatters.js

// Constants - camelCase
constants.js
config.js
```

### Hooks Usage
```javascript
// Good - Custom hooks start with 'use'
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await api.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  return { products, loading };
};

// Use the custom hook
const ProductList = () => {
  const { products, loading } = useProducts();
  
  if (loading) return <Loader />;
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### Conditional Rendering
```javascript
// Good - Clear conditional rendering
const ProductCard = ({ product, isLoading }) => {
  if (isLoading) {
    return <Skeleton />;
  }
  
  if (!product) {
    return <EmptyState message="Product not found" />;
  }
  
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      {product.discount > 0 && (
        <Badge variant="success">
          {product.discount}% OFF
        </Badge>
      )}
    </div>
  );
};

// Bad - Nested ternaries
const ProductCard = ({ product, isLoading }) => {
  return isLoading ? <Skeleton /> : !product ? <EmptyState /> : (
    <div>
      <h3>{product.name}</h3>
      {product.discount > 0 ? <Badge>{product.discount}% OFF</Badge> : null}
    </div>
  );
};
```

### Array Methods
```javascript
// Good - Use appropriate array methods
const activeProducts = products.filter(p => p.is_active);
const productNames = products.map(p => p.name);
const totalValue = products.reduce((sum, p) => sum + p.price, 0);
const hasExpensive = products.some(p => p.price > 1000);
const allInStock = products.every(p => p.stock > 0);

// Bad - Manual loops when array methods are better
const activeProducts = [];
for (let i = 0; i < products.length; i++) {
  if (products[i].is_active) {
    activeProducts.push(products[i]);
  }
}
```

### Async/Await
```javascript
// Good - Use async/await with try/catch
const fetchProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};

// Bad - Promise chains (use async/await instead)
const fetchProducts = () => {
  return api.get('/products')
    .then(response => response.data)
    .catch(error => {
      console.error('Failed to fetch products:', error);
      throw error;
    });
};
```

## 🎨 CSS/Styling

### Naming Convention
Use **BEM (Block Element Modifier)** for CSS classes:

```css
/* Block */
.product-card {
  padding: 1rem;
  border: 1px solid #ddd;
}

/* Element */
.product-card__image {
  width: 100%;
  height: auto;
}

.product-card__title {
  font-size: 1.25rem;
  font-weight: bold;
}

/* Modifier */
.product-card--featured {
  border-color: #007bff;
  background: #f0f8ff;
}

.product-card__image--large {
  height: 300px;
  object-fit: cover;
}
```

### Tailwind CSS
When using Tailwind, prefer utility classes:

```jsx
// Good - Utility-first approach
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
  <span className="text-xl font-bold text-blue-600">
    KES {product.price}
  </span>
</div>

// When needed, extract components for repeated patterns
// In tailwind.config.js or component file
const cardClasses = "p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow";
```

## 📁 File Organization

### Backend Structure
```
backend/
├── apps/
│   ├── accounts/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── tests/
│   │   │   ├── test_models.py
│   │   │   ├── test_views.py
│   │   │   └── test_serializers.py
│   │   └── admin.py
│   └── products/
│       └── ... (same structure)
├── ecommerce/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── requirements.txt
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Loader.jsx
│   │   ├── products/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductList.jsx
│   │   │   └── ProductFilter.jsx
│   │   └── layout/
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       └── Sidebar.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   └── ProductDetail.jsx
│   ├── hooks/
│   │   ├── useProducts.js
│   │   ├── useAuth.js
│   │   └── useCart.js
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── products.js
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   └── App.jsx
└── package.json
```

## 💬 Comments and Documentation

### When to Comment
```python
# Good - Explain WHY, not WHAT
# Use cached value to avoid expensive database query during peak hours
cached_result = cache.get(cache_key)

# Calculate compound interest for savings accounts only
# Checking accounts use simple interest
if account.type == 'savings':
    interest = calculate_compound_interest(balance, rate)

# Bad - Obvious comments
# Increment counter by 1
counter += 1

# Get user from database
user = User.objects.get(id=user_id)
```

### JSDoc Comments
```javascript
/**
 * Calculate discounted price with tax.
 * 
 * @param {number} price - Original price
 * @param {number} discountPercent - Discount percentage (0-100)
 * @param {number} taxRate - Tax rate (0-1)
 * @returns {number} Final price after discount and tax
 * 
 * @example
 * const finalPrice = calculateFinalPrice(100, 10, 0.15);
 * // Returns: 103.5 (90 after 10% discount + 15% tax)
 */
const calculateFinalPrice = (price, discountPercent, taxRate) => {
  const discounted = price * (1 - discountPercent / 100);
  return discounted * (1 + taxRate);
};
```

## 📝 Git Commit Messages

### Format
```
type(scope): brief description

Detailed explanation of what changed and why.
Include motivation and context.

Closes #issue_number
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style/formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

### Examples
```bash
# Good
feat(products): add product filtering by price range

Implemented min and max price filters on product list page.
Users can now filter products within their budget.

Closes #234

# Good
fix(checkout): resolve payment processing timeout

Increased timeout from 30s to 60s for M-Pesa payments.
M-Pesa API sometimes takes longer during peak hours.

Fixes #456

# Bad
update code  # Too vague
fix bug  # Not specific
changed stuff  # Not descriptive
```

## ✅ Pre-Commit Checklist

- [ ] Code follows style guide
- [ ] No console.log() or print() statements
- [ ] No commented-out code
- [ ] Meaningful variable/function names
- [ ] Complex logic has comments
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Linter passes
- [ ] No security vulnerabilities

## 🔧 Linting Configuration

### Python (backend)
```bash
# Install
pip install flake8 black isort

# Run linter
flake8 .

# Auto-format
black .
isort .
```

### JavaScript (frontend)
```bash
# Install
npm install -D eslint prettier

# Run linter
npm run lint

# Auto-fix
npm run lint:fix
```

## 📚 Resources

- [PEP 8 - Python Style Guide](https://pep8.org/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [BEM Methodology](http://getbem.com/)

---

**Last Updated:** 2024-11
**Version:** 1.0
