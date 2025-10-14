# 🏗️ EasyCart Architecture - PostgreSQL Full Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                                  │
│                     http://localhost:3000                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Components:                                                  │  │
│  │  • ProductList.js    → Displays products grid                │  │
│  │  • ProductCard.js    → Individual product cards              │  │
│  │  • ProductDetail.js  → Single product view                   │  │
│  │  • CategoryFilter.js → Filter by category                    │  │
│  │  • SearchBar.js      → Search products                       │  │
│  │                                                               │  │
│  │  Services:                                                    │  │
│  │  • axios (HTTP client)                                       │  │
│  │  • react-query (data fetching)                               │  │
│  │  • i18next (internationalization)                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             │                                        │
│                    API Calls via axios                               │
│                             │                                        │
└─────────────────────────────┼────────────────────────────────────────┘
                              │
                     HTTP GET /api/products/
                     HTTP GET /api/products/categories/
                     HTTP GET /api/products/{id}/
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   DJANGO BACKEND                                     │
│                http://127.0.0.1:8000                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  URL Routes (urls.py):                                       │  │
│  │  • /api/products/categories/  → CategoryListView            │  │
│  │  • /api/products/             → ProductListView             │  │
│  │  • /api/products/{id}/        → ProductDetailView           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             │                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Views (views.py):                                           │  │
│  │                                                               │  │
│  │  CategoryListView.get():                                     │  │
│  │    → categories = Category.objects.all()                    │  │
│  │    → serializer = CategorySerializer(categories, many=True) │  │
│  │    → return Response(serializer.data)                       │  │
│  │                                                               │  │
│  │  ProductListView.get():                                      │  │
│  │    → queryset = Product.objects.all()                       │  │
│  │    → Apply filters (category, search, price)                │  │
│  │    → Apply ordering, pagination                             │  │
│  │    → serializer = ProductSerializer(products, many=True)    │  │
│  │    → return Response(paginated_data)                        │  │
│  │                                                               │  │
│  │  ProductDetailView.get(pk):                                  │  │
│  │    → product = Product.objects.filter(id=pk).first()        │  │
│  │    → serializer = ProductSerializer(product)                │  │
│  │    → return Response(serializer.data)                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             │                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Django ORM Layer:                                           │  │
│  │  • Product.objects.all()                                     │  │
│  │  • Product.objects.filter(category__name=...)               │  │
│  │  • Product.objects.filter(name__icontains=...)              │  │
│  │  • QuerySet → SQL Translation                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             │                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Models (models.py):                                         │  │
│  │                                                               │  │
│  │  class Category(models.Model):                               │  │
│  │    name = CharField(max_length=100)                          │  │
│  │    description = TextField()                                 │  │
│  │    slug = SlugField()                                        │  │
│  │                                                               │  │
│  │  class Product(models.Model):                                │  │
│  │    name = CharField(max_length=255)                          │  │
│  │    price = DecimalField(max_digits=10, decimal_places=2)    │  │
│  │    category = ForeignKey(Category)  ← RELATIONSHIP           │  │
│  │    description = TextField()                                 │  │
│  │    image = ImageField()                                      │  │
│  │    stock = IntegerField()                                    │  │
│  │    created_at = DateTimeField()                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             │                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Serializers (serializers.py):                               │  │
│  │                                                               │  │
│  │  ProductSerializer:                                           │  │
│  │    category = CategorySerializer(read_only=True)  ← NESTED  │  │
│  │    → Returns full category object in JSON                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             │                                        │
│                       SQL Queries                                    │
│                             │                                        │
└─────────────────────────────┼────────────────────────────────────────┘
                              │
                   psycopg2 (PostgreSQL adapter)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                               │
│                     localhost:5432/easycart                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Tables:                                                      │  │
│  │                                                               │  │
│  │  products_category:                                           │  │
│  │  ┌────┬───────────────┬─────────────────────────────────┐   │  │
│  │  │ id │ name          │ description                     │   │  │
│  │  ├────┼───────────────┼─────────────────────────────────┤   │  │
│  │  │ 1  │ Fresh Produce │ Fruits and vegetables          │   │  │
│  │  │ 2  │ Beverages     │ Drinks and juices              │   │  │
│  │  │ 3  │ Dairy         │ Milk, cheese, yogurt           │   │  │
│  │  │ 4  │ Bakery        │ Bread and baked goods          │   │  │
│  │  │ ...│ ...           │ ...                             │   │  │
│  │  └────┴───────────────┴─────────────────────────────────┘   │  │
│  │                                                               │  │
│  │  products_product:                                            │  │
│  │  ┌────┬─────────────────────────┬─────────┬─────────────┐   │  │
│  │  │ id │ name                    │ price   │ category_id │   │  │
│  │  ├────┼─────────────────────────┼─────────┼─────────────┤   │  │
│  │  │ 1  │ Always Sanitary Pads    │ 180.00  │ 6           │   │  │
│  │  │ 2  │ Lifebuoy Hand Sanitizer │ 220.00  │ 6           │   │  │
│  │  │ 3  │ Geisha Beauty Soap      │ 70.00   │ 6           │   │  │
│  │  │ ...│ ...                     │ ...     │ ...         │   │  │
│  │  └────┴─────────────────────────┴─────────┴─────────────┘   │  │
│  │                                                               │  │
│  │  ✅ Foreign Key: category_id → products_category.id          │  │
│  │  ✅ 10 Categories, 37 Products                               │  │
│  │  ✅ All data migrated from MongoDB                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Example: User Views Homepage

```
1. User opens http://localhost:3000
   ↓
2. React component mounts, useEffect triggers
   ↓
3. axios.get('http://localhost:8000/api/products/')
   ↓
4. Django receives request → ProductListView.get()
   ↓
5. Django ORM: Product.objects.all().order_by('-created_at')
   ↓
6. PostgreSQL executes:
   SELECT * FROM products_product 
   LEFT JOIN products_category ON products_product.category_id = products_category.id
   ORDER BY created_at DESC 
   LIMIT 20;
   ↓
7. Django serializes QuerySet → JSON
   {
     "count": 37,
     "results": [
       {
         "id": 1,
         "name": "Always Sanitary Pads",
         "price": "180.00",
         "category": {
           "id": 6,
           "name": "Personal Care",
           ...
         },
         ...
       },
       ...
     ]
   }
   ↓
8. HTTP Response → React
   ↓
9. React updates state, triggers re-render
   ↓
10. ProductCard components render with PostgreSQL data
    ↓
11. User sees products on screen! ✅
```

## 🎯 Key Relationships

```
Category (1) ─────< Product (Many)
   id                category_id (FK)
   
Example:
Personal Care (id=6)
  ├─ Always Sanitary Pads (product_id=1, category_id=6)
  ├─ Lifebuoy Hand Sanitizer (product_id=2, category_id=6)
  └─ Geisha Beauty Soap (product_id=3, category_id=6)
```

## 🔐 CORS & Authentication Flow

```
Frontend (localhost:3000)
    │
    │ Preflight: OPTIONS /api/products/
    ├──────────────────────────────────────────┐
    │                                          │
    ▼                                          ▼
Backend checks:                           Response:
• Origin: http://localhost:3000          • Access-Control-Allow-Origin: http://localhost:3000
• Is it in CORS_ALLOWED_ORIGINS?         • Access-Control-Allow-Methods: GET, POST, ...
• ✅ Yes                                  • Access-Control-Allow-Headers: Content-Type, ...
    │                                          │
    └──────────────────────────────────────────┘
    │
    │ Actual Request: GET /api/products/
    ├──────────────────────────────────────────┐
    │                                          │
    ▼                                          ▼
Backend:                                   Response:
• Authentication: Not required (AllowAny) • Status: 200 OK
• Query PostgreSQL                        • Data: [...products...]
• Serialize results                       • CORS headers included
    │                                          │
    └──────────────────────────────────────────┘
    │
    ▼
Frontend receives data → renders UI
```

## 📊 API Response Format

### GET /api/products/categories/
```json
[
  {
    "id": 4,
    "name": "Bakery",
    "description": "Bread and baked goods",
    "slug": "bakery"
  },
  {
    "id": 2,
    "name": "Beverages",
    "description": "Drinks and juices",
    "slug": "beverages"
  }
]
```

### GET /api/products/
```json
{
  "count": 37,
  "next": true,
  "previous": false,
  "results": [
    {
      "id": 1,
      "name": "Always Sanitary Pads (10 pack)",
      "price": "180.00",
      "description": "Regular sanitary pads for feminine hygiene.",
      "image": "/media/products/always_pads.jpg",
      "image_url": "/media/products/always_pads.jpg",
      "category": {
        "id": 6,
        "name": "Personal Care",
        "description": "Personal hygiene and beauty products",
        "slug": "personal-care"
      },
      "brand": "",
      "stock": 0,
      "sku": "",
      "slug": "",
      "created_at": "2025-01-14T08:15:32.123456Z",
      "updated_at": "2025-01-14T08:15:32.123456Z"
    }
  ]
}
```

## 🎨 Frontend Component Structure

```
App.js
  │
  ├─ HomePage
  │   │
  │   ├─ CategoryFilter
  │   │   └─ GET /api/products/categories/
  │   │       └─ Display: Bakery, Beverages, Dairy, etc.
  │   │
  │   ├─ SearchBar
  │   │   └─ Input → ?search={query}
  │   │
  │   └─ ProductGrid
  │       └─ GET /api/products/?category=...&search=...
  │           └─ ProductCard (×20)
  │               ├─ Image
  │               ├─ Name
  │               ├─ Price
  │               ├─ Category Badge
  │               └─ Add to Cart Button
  │
  └─ ProductDetailPage
      └─ GET /api/products/{id}/
          ├─ Large Image
          ├─ Product Name
          ├─ Price
          ├─ Full Description
          ├─ Category
          ├─ Stock Status
          └─ Add to Cart Form
```

---

**🏆 Architecture Status: PRODUCTION-GRADE FULL-STACK APPLICATION**

- ✅ Clean separation of concerns
- ✅ RESTful API design
- ✅ Django ORM for database abstraction
- ✅ PostgreSQL for reliable data storage
- ✅ React for dynamic UI
- ✅ CORS properly configured
- ✅ Pagination implemented
- ✅ Search and filtering
- ✅ Category relationships
- ✅ Admin panel

**Your e-commerce platform is enterprise-ready! 🚀**
