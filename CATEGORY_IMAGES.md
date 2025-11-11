# Category Images - Professional & Clean

## Recommended Image Sources

### Free High-Quality Stock Photos:
1. **Unsplash** - https://unsplash.com (Free, no attribution required)
2. **Pexels** - https://pexels.com (Free, no attribution required)
3. **Pixabay** - https://pixabay.com (Free, no attribution required)

### Image Specifications:
- **Format:** WebP (best) or JPG
- **Size:** 200x200px minimum (1:1 ratio)
- **File Size:** < 50KB (optimized)
- **Style:** Clean, professional, consistent lighting

---

## Suggested Category Images (Unsplash URLs)

### 🛒 Groceries
```
https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop
```
Fresh vegetables and fruits in shopping basket

### 📱 Electronics
```
https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop
```
Modern electronics and gadgets

### 👗 Fashion
```
https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop
```
Clothing on hangers

### 🏠 Home & Kitchen
```
https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&h=200&fit=crop
```
Modern kitchen interior

### 💄 Beauty & Personal Care
```
https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop
```
Beauty products and cosmetics

### ⚽ Sports & Outdoors
```
https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=200&fit=crop
```
Sports equipment

### 📚 Books & Stationery
```
https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=200&fit=crop
```
Stack of books

### 🧸 Toys & Games
```
https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=200&h=200&fit=crop
```
Colorful toys

### 💊 Health & Wellness
```
https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&h=200&fit=crop
```
Health and wellness products

### 🚗 Automotive
```
https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&h=200&fit=crop
```
Car and automotive

---

## How to Add Category Images

### Option 1: Via Django Admin
1. Go to `/admin/products/category/`
2. Click on a category
3. Paste the image URL in the `image_url` field
4. Save

### Option 2: Via API (if you have admin access)
```python
from apps.products.models import Category

# Update category with image URL
category = Category.objects.get(name='Groceries')
category.image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop'
category.save()
```

### Option 3: Upload to Cloudinary
1. Upload image to your Cloudinary account
2. Copy the Cloudinary URL
3. Add to category `image_url` field

---

## Image Optimization Tips

### For Best Performance:
1. **Use Cloudinary transformations:**
   ```
   https://res.cloudinary.com/YOUR_CLOUD/image/upload/w_200,h_200,c_fill,f_auto,q_auto/image.jpg
   ```
   - `w_200,h_200` - Resize to 200x200
   - `c_fill` - Crop to fill
   - `f_auto` - Auto format (WebP for supported browsers)
   - `q_auto` - Auto quality

2. **Unsplash optimization:**
   ```
   ?w=200&h=200&fit=crop&auto=format&q=80
   ```

3. **Consistent style:**
   - Same lighting
   - Same background style (white/neutral)
   - Same perspective (flat lay or angled)

---

## Alternative: Icon-Based Categories

If you prefer icons over images, the CategoryCard component already has fallback emojis:
- 🛒 Groceries
- 📱 Electronics
- 👗 Fashion
- 🏠 Home & Kitchen
- 💄 Beauty
- ⚽ Sports
- 📚 Books
- 🧸 Toys
- 💊 Health
- 🚗 Automotive

These will display automatically if no image is provided.

---

## Testing

After adding images, test on:
- ✅ Mobile (iOS Safari, Chrome)
- ✅ Desktop (Chrome, Firefox, Safari)
- ✅ Slow 3G connection
- ✅ Image load failures (fallback to emoji)
