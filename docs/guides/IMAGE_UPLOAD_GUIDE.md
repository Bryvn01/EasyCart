# How to Add Product Images (File Upload & Image URL)


## Method 1: Django Admin Panel (Recommended)

1. **Start Backend Server**:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Access Admin Panel**: http://localhost:8000/admin/

3. **Login**:
   - Username: `admin`
   - Password: `<your-admin-password>`

4. **Navigate to Products**:
   - Click "Products" under "PRODUCTS" section

5. **Edit Product**:
   - Click on any product name (e.g., "Unga wa Dola 2kg")

6. **Upload Image**:
   - Scroll to "Media" section
   - Click "Choose File" next to "Image" field to upload a file **OR**
   - Enter an **Image URL** in the "Image URL" field (if available)
   - Only one (file or URL) will be used per image
   - Click "Save"


## Method 2: Bulk Upload via Script

```bash
cd backend
pip install requests
python add_sample_images.py
```


## Method 3: Frontend Admin Panel (Recommended for Most Users)

1. **Go to Admin Products page** (e.g., `/admin/products`)
2. Click **Add Product** or **Edit** on an existing product
3. In the product modal:
   - **Upload an image file** (JPG, PNG, GIF, under 5MB)
   - **OR** paste an **Image URL** (must be a valid image link)
   - Only one will be used; uploading a file clears the URL and vice versa
4. Preview the image before saving
5. Click **Save** to submit

**Validation:**
- Only one of file or URL is accepted per image
- File size and type are validated client-side
- Image URL is validated for format and accessibility

**Accessibility:**
- Image preview includes alt text
- Error messages are announced for screen readers

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
- ✅ Admin dashboard
- ✅ Fallback placeholder if no image or if image fails to load

## Troubleshooting

- **Image not showing**: Check file path or URL in admin; ensure the image URL is valid and accessible
- **404 error**: Ensure Django server is running and media/static files are served
- **Upload fails**: Check file size, type, and format; ensure only one of file or URL is provided
- **Image URL not working**: Make sure the URL is a direct link to an image (ends with .jpg, .png, etc.) and is publicly accessible
- **Frontend preview not updating**: Only one input (file or URL) is used at a time; clear the other to update preview

## API & Integration Notes

- The backend API supports both file uploads (multipart/form-data) and image URLs (JSON body)
- The frontend automatically chooses the correct format when submitting product forms
- See [ENHANCED_PRODUCT_API_GUIDE.md](ENHANCED_PRODUCT_API_GUIDE.md) for API details

## Example: Adding a Product with Image URL (API)

```json
{
   "name": "Sample Product",
   "image_url": "https://example.com/image.jpg"
}
```

## Example: Adding a Product with File Upload (API)

Send as `multipart/form-data` with a file field named `image`.

## See Also
- [ENHANCED_PRODUCT_API_GUIDE.md](ENHANCED_PRODUCT_API_GUIDE.md)
- [FRONTEND_IMPLEMENTATION_GUIDE.md](FRONTEND_IMPLEMENTATION_GUIDE.md)
