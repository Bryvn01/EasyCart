# EasyCart Vercel Serverless Functions

This directory contains Vercel serverless functions that replace the Express backend.

## Structure

```
/api
├── _utils/              # Shared utilities
│   ├── mongodb.js      # MongoDB connection
│   ├── cors.js         # CORS headers
│   └── auth.js         # Authentication helpers
├── auth/               # Authentication endpoints
│   ├── register.js     # POST /api/auth/register
│   ├── login.js        # POST /api/auth/login
│   └── profile.js      # GET /api/auth/profile
├── products/           # Product endpoints
│   ├── index.js        # GET/POST /api/products
│   ├── [id].js         # GET/PUT/DELETE /api/products/:id
│   └── categories.js   # GET /api/products/categories
├── categories/         # Category endpoints
│   ├── index.js        # GET/POST /api/categories
│   └── [id].js         # GET/PUT/DELETE /api/categories/:id
├── upload/             # File upload endpoints
│   ├── image.js        # POST /api/upload/image
│   └── images.js       # POST /api/upload/images
├── health.js           # GET /api/health
└── seed.js             # POST /api/seed
```

## API Endpoints

### Health Check
- **GET** `/api/health` - Check API health and database status

### Authentication
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - User login
- **GET** `/api/auth/profile` - Get user profile (requires auth)

### Products
- **GET** `/api/products` - Get all products with filtering/pagination
- **POST** `/api/products` - Create product (admin only)
- **GET** `/api/products/:id` - Get product by ID
- **PUT** `/api/products/:id` - Update product (admin only)
- **DELETE** `/api/products/:id` - Delete product (admin only)
- **GET** `/api/products/categories` - Get all categories

### Categories
- **GET** `/api/categories` - Get all categories
- **POST** `/api/categories` - Create category
- **GET** `/api/categories/:id` - Get category by ID
- **PUT** `/api/categories/:id` - Update category
- **DELETE** `/api/categories/:id` - Delete category

### Upload
- **POST** `/api/upload/image` - Upload single image (admin only)
- **POST** `/api/upload/images` - Upload multiple images (admin only)

### Seed
- **POST** `/api/seed` - Seed database with sample data

## Environment Variables

Set these in your Vercel project settings:

```bash
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/easycart
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-frontend.vercel.app,https://your-admin.vercel.app
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
# Or individual Cloudinary variables:
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables:
```bash
vercel env add MONGO_URI
vercel env add JWT_SECRET
vercel env add FRONTEND_URL
vercel env add CLOUDINARY_URL
```

4. Redeploy with environment variables:
```bash
vercel --prod
```

### Via GitHub Integration

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel project settings
3. Push to main branch to trigger deployment

## CORS Configuration

All endpoints automatically handle CORS with the following configuration:
- Allows origins specified in `FRONTEND_URL` environment variable
- Allows credentials
- Supports preflight requests
- Permissive in development (allows unlisted origins with warning)

## MongoDB Connection

MongoDB connections are cached per serverless function instance to improve performance. The connection is automatically managed and reused across requests to the same function instance.

## Authentication

Protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Admin-only endpoints require the authenticated user to have `role: 'admin'`.

## Rate Limiting

The `/api/products/categories` endpoint includes rate limiting (100 requests per 15 minutes per IP).

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Fallback Data

When MongoDB is unavailable, endpoints return fallback data:
- Products: 8 sample products
- Categories: 11 predefined categories

This ensures the API remains functional even during database outages.

## File Uploads

The upload endpoints expect base64-encoded image data in the request body:

```javascript
// Single image
POST /api/upload/image
{
  "image": "data:image/png;base64,iVBORw0KGgo...",
  "alt": "Product image"
}

// Multiple images
POST /api/upload/images
{
  "images": [
    "data:image/png;base64,iVBORw0KGgo...",
    "data:image/jpeg;base64,/9j/4AAQSkZJ..."
  ],
  "alt": "Product images"
}
```

Images are uploaded to Cloudinary if configured, otherwise stored as base64.

## Testing Locally

You can test serverless functions locally using Vercel Dev:

```bash
cd /path/to/EasyCart
vercel dev
```

This will start a local development server at `http://localhost:3000` with your serverless functions.

## Migration from Express

The serverless functions maintain 100% API compatibility with the original Express backend. Simply update your frontend API URLs to point to the Vercel deployment.

### Changes Required in Frontend:
```javascript
// Old
const API_URL = 'https://easycart-backend.onrender.com';

// New
const API_URL = 'https://your-project.vercel.app';
```

All endpoints remain the same, no code changes needed!

## Performance

- Cold start: ~1-3 seconds
- Warm requests: ~100-300ms
- MongoDB connection cached per instance
- 1GB memory per function
- 10 second timeout

## Monitoring

Monitor your functions in the Vercel dashboard:
- Function logs
- Performance metrics
- Error tracking
- Bandwidth usage

## Troubleshooting

### MongoDB Connection Errors
- Verify `MONGO_URI` is set correctly
- Ensure MongoDB Atlas allows connections from Vercel IPs (0.0.0.0/0)
- Check MongoDB Atlas cluster is running

### CORS Errors
- Add your frontend URL to `FRONTEND_URL` environment variable
- Ensure URLs are comma-separated without spaces

### Authentication Errors
- Verify `JWT_SECRET` is set and matches across deployments
- Check Authorization header format: `Bearer <token>`

### Upload Errors
- Verify Cloudinary credentials are set
- Ensure images are properly base64 encoded
- Check file size limits (5MB per image)

## Support

For issues or questions, please refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [EasyCart Repository](https://github.com/Bryvn01/EasyCart)
