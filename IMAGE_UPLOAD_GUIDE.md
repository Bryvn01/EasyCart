# How to Add Product Images

## Method 1: Django Admin Panel (Recommended)

1. **Start Backend Server**:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Access Admin Panel**: http://localhost:8000/admin/

3. **Login**: 
   - Username: `admin`
   - Password: `admin123`

4. **Navigate to Products**:
   - Click "Products" under "PRODUCTS" section

5. **Edit Product**:
   - Click on any product name (e.g., "Unga wa Dola 2kg")

6. **Upload Image**:
   - Scroll to "Media" section
   - Click "Choose File" next to "Image" field
   - Select image from your computer
   - Click "Save"

## Method 2: Bulk Upload via Script

```bash
cd backend
pip install requests
python add_sample_images.py
```

## Image Requirements

- **Format**: JPG, PNG, GIF
- **Size**: Recommended 300x300px or larger
- **File Size**: Under 5MB
- **Naming**: Use descriptive names

## Where Images Are Stored

- **Location**: `backend/media/products/`
- **URL**: `http://localhost:8000/media/products/filename.jpg`

## Frontend Display

Images automatically appear on:
- ✅ Product listing page
- ✅ Product detail page  
- ✅ Shopping cart
- ✅ Fallback placeholder if no image

## Troubleshooting

- **Image not showing**: Check file path in admin
- **404 error**: Ensure Django server is running
- **Upload fails**: Check file size and format