# ProductList Component - Visual Layout

## Component States

### 1. Loading State
```
┌────────────────────────────────────────┐
│                                        │
│           ⟳ (spinning circle)          │
│                                        │
│       Loading products...              │
│                                        │
└────────────────────────────────────────┘
```

### 2. Error State
```
┌────────────────────────────────────────┐
│                                        │
│                  ⚠️                    │
│                                        │
│       Error Loading Products           │
│    Network error / Failed to fetch     │
│                                        │
│          ┌──────────────┐              │
│          │  Try Again   │              │
│          └──────────────┘              │
│                                        │
└────────────────────────────────────────┘
```

### 3. Empty State
```
┌────────────────────────────────────────┐
│                                        │
│                  📦                    │
│                                        │
│       No products available            │
│   Check back later for new products!   │
│                                        │
└────────────────────────────────────────┘
```

### 4. Products Grid - Mobile (2 columns)
```
┌───────────────┬───────────────┐
│ ┌───────────┐ │ ┌───────────┐ │
│ │   Image   │ │ │   Image   │ │
│ │  (48rem)  │ │ │  (48rem)  │ │
│ └───────────┘ │ └───────────┘ │
│ Electronics   │ Fashion       │
│ Samsung S21   │ Nike Shoes    │
│ KSh 45,000    │ KSh 8,500     │
│ Latest phone  │ Comfortable   │
│ ┌───────────┐ │ ┌───────────┐ │
│ │Add to Cart│ │ │Add to Cart│ │
│ └───────────┘ │ └───────────┘ │
├───────────────┼───────────────┤
│ ┌───────────┐ │ ┌───────────┐ │
│ │   Image   │ │ │   Image   │ │
│ └───────────┘ │ └───────────┘ │
│ Groceries     │ Beauty        │
│ Rice 10kg     │ Face Cream    │
│ KSh 1,200     │ KSh 2,500     │
└───────────────┴───────────────┘
```

### 5. Products Grid - Desktop (4 columns)
```
┌─────────┬─────────┬─────────┬─────────┐
│┌───────┐│┌───────┐│┌───────┐│┌───────┐│
││ Image ││ Image ││ Image ││ Image ││
│└───────┘│└───────┘│└───────┘│└───────┘│
│Electronics│Fashion │Groceries│Beauty  │
│Samsung S21│Nike    │Rice 10kg│Cream   │
│KSh 45,000 │KSh 8,500│KSh 1,200│KSh 2,500│
│Latest...  │Comfort..│Premium..│Natural.│
│┌─────────┐│┌───────┐│┌───────┐│┌───────┐│
││Add Cart ││Add Cart││Add Cart││Add Cart││
│└─────────┘│└───────┘│└───────┘│└───────┘│
└─────────┴─────────┴─────────┴─────────┘
```

## Product Card Anatomy

```
┌─────────────────────────────────┐
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │      Product Image      │   │
│  │        (h-48)           │   │
│  │   (or 📦 placeholder)   │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Category Badge                 │  <- Small, primary color
│  Product Name (truncated)       │  <- Bold, 2 lines max
│                                 │
│  KSh 45,000        [10 in stock]│  <- Price | Stock
│                                 │
│  Product description text       │  <- 2 lines max
│  truncated if too long...       │
│                                 │
│  ┌─────────────────────────┐   │
│  │      Add to Cart        │   │  <- Full width button
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

## Responsive Breakpoints

| Screen Size | Columns | Grid Class          |
|------------|---------|---------------------|
| Mobile     | 2       | `grid-cols-2`       |
| Tablet     | 2       | `grid-cols-2`       |
| Desktop    | 4       | `md:grid-cols-4`    |
| Large      | 4       | `md:grid-cols-4`    |

## Color Scheme

- **Primary**: Used for buttons, category badges
- **Gray-50**: Background color
- **Gray-900**: Product name text
- **Gray-600**: Description text
- **Green**: Stock indicator (in stock)
- **Red**: Stock indicator (out of stock)
- **White**: Card background

## Typography

- **Product Name**: text-lg, font-semibold
- **Price**: text-2xl, font-bold
- **Category**: text-xs, font-semibold
- **Description**: text-sm
- **Button**: Full width, py-2

## Spacing

- **Card Gap**: gap-6 (1.5rem between cards)
- **Card Padding**: p-4 (1rem inside card)
- **Container Padding**: py-8 (vertical)

## Hover Effects

- Cards lift slightly: `hover:shadow-lg`
- Smooth transitions on all elements
- Button darkens on hover: `hover:bg-primary-dark`

## Sample Product Display

### Example 1: Samsung Galaxy S21
```
┌─────────────────────────────────┐
│  ┌─────────────────────────┐   │
│  │  [Samsung S21 Image]    │   │
│  └─────────────────────────┘   │
│                                 │
│  Electronics                    │
│  Samsung Galaxy S21             │
│                                 │
│  KSh 45,000        10 in stock  │
│                                 │
│  Latest smartphone with 5G      │
│  technology and amazing...      │
│                                 │
│  ┌─────────────────────────┐   │
│  │      Add to Cart        │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Example 2: Out of Stock Item
```
┌─────────────────────────────────┐
│  ┌─────────────────────────┐   │
│  │  [Product Image]        │   │
│  └─────────────────────────┘   │
│                                 │
│  Fashion                        │
│  Designer Jacket                │
│                                 │
│  KSh 12,500     [Out of stock] │  <- Red badge
│                                 │
│  Premium quality designer       │
│  jacket for all seasons         │
│                                 │
│  ┌─────────────────────────┐   │
│  │     Out of Stock        │   │  <- Disabled button
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

## Key Features Highlighted

✅ **Image Display**
- Shows `image_url` or `image` field
- Fallback to 📦 placeholder
- Maintains aspect ratio (h-48)
- Error handling if image fails to load

✅ **Price Formatting**
- Always displays as **KSh XX,XXX**
- Uses `.toLocaleString()` for comma separators
- Examples: KSh 1,200 | KSh 45,000 | KSh 125,500

✅ **Truncation**
- Product name: 2 lines max (`line-clamp-2`)
- Description: 2 lines max (`line-clamp-2`)
- Full name available on hover (title attribute)

✅ **Stock Indicators**
- Green badge: "10 in stock"
- Red badge: "Out of stock"
- Button disabled when out of stock

✅ **Mobile-First**
- 2 columns on mobile (easy thumb reach)
- Scales to 4 columns on desktop (more content visible)
- Gap adjusts based on screen size

## Integration in Full Page

```
┌─────────────────────────────────────────┐
│             NAVBAR                      │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │        HERO SECTION             │   │
│  │   Welcome to EasyCart           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Our Products                           │
│  Browse our wide selection...           │
│                                         │
│  ┌───────┬───────┬───────┬───────┐    │
│  │Product│Product│Product│Product│    │  <- ProductList
│  │ Card  │ Card  │ Card  │ Card  │    │     Component
│  └───────┴───────┴───────┴───────┘    │
│  ┌───────┬───────┬───────┬───────┐    │
│  │Product│Product│Product│Product│    │
│  │ Card  │ Card  │ Card  │ Card  │    │
│  └───────┴───────┴───────┴───────┘    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       FEATURES SECTION          │   │
│  │  🚚 Fast | 💳 Secure | ⭐ Quality│   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│             FOOTER                      │
└─────────────────────────────────────────┘
```

This visual layout ensures a clean, modern e-commerce experience that works perfectly on all devices!
