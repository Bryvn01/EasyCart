# Next.js Products Page

This directory contains a Next.js implementation of the products page that fetches data from the Django REST backend.

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

## Features

- **Client-side data fetching** using `useEffect` and `useState`
- **Graceful error handling** with user-friendly error messages
- **Loading states** to prevent blank page appearance
- **DRF pagination support** - automatically unwraps `results` array
- **Dual environment support** - works locally and in production
- **TypeScript** for type safety
- **Tailwind CSS** for styling

## API Response Handling

The page handles both Django REST Framework paginated responses and direct array responses:

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

The page automatically unwraps the `results` array when present.

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

## Deployment

### Vercel (Recommended for Next.js)

1. Connect your repository to Vercel
2. Set the root directory to `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://easycart-j6ue.onrender.com/api`
4. Deploy

### Build Output

The Next.js build creates an optimized production build in `.next/` directory.
