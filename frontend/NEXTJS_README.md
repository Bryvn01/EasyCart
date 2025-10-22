
# Next.js Products Page & Enhanced Media Handling

This directory contains the Next.js implementation of the products page, supporting robust media handling (file upload + image URL) and best-practice API error handling. It fetches data from the Django REST backend and is fully integrated with the latest EasyCart enhancements.

## Running the Next.js App

### Development Mode

```bash
cd frontend
npm run next:dev
```

The Next.js app will be available at http://localhost:3000

### Production Build

```bash
cd frontend
npm run next:build
npm run next:start
```

## Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
# For local development with Django backend on port 8000
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# For production (Render + Vercel)
NEXT_PUBLIC_API_URL=https://easycart-j6ue.onrender.com/api
```


## Features & Enhancements
- **Dual Image Handling:** Supports both file upload and direct image URLs for product images (see IMAGE_UPLOAD_GUIDE.md)
- **ProductEditModal:** Allows upload or URL, with instant preview, validation, and accessibility
- **Robust API Error Handling:** User-friendly error messages, loading states, and fallback logic
- **DRF Pagination Support:** Automatically unwraps `results` array
- **React Query v5:** All hooks use object form; QueryClientProvider in tests
- **TypeScript:** Full type safety
- **Tailwind CSS:** Modern, responsive styling


## API Response Handling
Handles both DRF paginated responses and direct arrays:

```typescript
// DRF Paginated Response
{
  "results": [...products],
  "count": 10,
  "next": "...",
  "previous": null
}

// Direct Array Response
[...products]
```
Automatically unwraps the `results` array when present.


## Project Structure
```
frontend/src/app/
├── layout.tsx          # Root layout for Next.js
└── products/
  └── page.tsx        # Products page with ProductList component
```

## Accessing the Products Page

Once the Next.js server is running, navigate to:
- http://localhost:3000/products

## Differences from React App

This Next.js implementation runs separately from the existing Create React App:

- **React App**: `npm start` (port 3000)
- **Next.js App**: `npm run next:dev` (port 3000)

Both apps can coexist in the same codebase but run on different ports or can be deployed separately.


## Testing & Coverage
- Run all tests:
  ```sh
  npm test
  ```
- Coverage and setup: see [TESTING_GUIDE.md](../TESTING_GUIDE.md)

## Environment Variables
Create `.env.local` in `frontend`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```
For production (Render/Vercel):
```env
NEXT_PUBLIC_API_URL=https://easycart-j6ue.onrender.com/api
```

## Deployment
See main [README.md](../README.md) for full deployment instructions.

---
## 📚 Additional Guides & References
- [IMAGE_UPLOAD_GUIDE.md](../IMAGE_UPLOAD_GUIDE.md): Dual image handling (file upload + URL)
- [ENHANCED_PRODUCT_API_GUIDE.md](../ENHANCED_PRODUCT_API_GUIDE.md): Product API reference
- [TESTING_GUIDE.md](../TESTING_GUIDE.md): Automated tests and coverage
- [SECURITY.md](../SECURITY.md): Security policy and known vulnerabilities

