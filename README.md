# EasyCart - E-Commerce Web Application

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-18+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-7+-green.svg)

A complete e-commerce solution with React frontend and unified Node.js/Express/MongoDB backend featuring advanced product management, real-time updates, and cloud-based image handling.

## 🎉 Latest Updates (v2.0)

**Major Backend Unification Complete!**

- ✅ **Unified Node.js Backend**: Single Express + MongoDB backend (port 5000)
- ✅ **Enhanced Product API**: SKU, multi-image, variants, SEO fields
- ✅ **Real-Time Features**: Socket.io for live inventory and price updates
- ✅ **Cloud Image Management**: Cloudinary integration with Sharp optimization
- ✅ **Comprehensive Documentation**: Full API docs and integration guides

**📚 New Documentation:**
- [Enhanced Product API Guide](ENHANCED_PRODUCT_API_GUIDE.md) - Complete API reference
- [Admin Dashboard Integration Guide](ADMIN_DASHBOARD_INTEGRATION_GUIDE.md) - Frontend integration
- [Django Deprecation Notice](DJANGO_DEPRECATION_NOTICE.md) - Migration information
- [Implementation Summary](IMPLEMENTATION_COMPLETE_SUMMARY.md) - Complete overview
- [Frontend Error Handling Guide](FRONTEND_ERROR_HANDLING_GUIDE.md) - **NEW!** Troubleshooting and diagnostics

## 🚀 Features

- **User Authentication**: JWT-based registration and login with role-based access control
- **Advanced Product Catalog**: Browse products with multi-image galleries, variants, and SEO optimization
- **Shopping Cart**: Add/remove items with real-time stock validation
- **Order Management**: Complete checkout process with order tracking
- **Enhanced Admin Dashboard**: Advanced product management with inventory alerts
- **Multi-Image Upload**: Up to 5 optimized images per product with Cloudinary CDN
- **Real-Time Updates**: Live inventory, price changes, and low stock alerts via Socket.io
- **Wishlist**: Save favorite products
- **Reviews & Ratings**: Product review system
- **Responsive Design**: Mobile-first responsive UI
- **SEO Optimized**: Auto-generated slugs, meta titles, and descriptions

## 🛠️ Tech Stack

**Frontend:**
- React 18+ with Hooks
- Context API for state management
- Socket.io Client for real-time updates
- CSS3 with responsive design
- Axios for API calls

**Backend (Unified Node.js):**
- Node.js 18+ / Express 5+
- MongoDB 7+ with Mongoose
- Socket.io for real-time communication
- JWT Authentication with RBAC
- Cloudinary for cloud image storage
- Sharp for image optimization
- Multer for file uploads
- Helmet for security headers

**Infrastructure:**
- MongoDB Atlas (production) / Local MongoDB (development)
- Cloudinary CDN for image delivery
- Socket.io for WebSocket connections

## 📋 Prerequisites

- Node.js 18+
- MongoDB 7+ (local or Atlas)
- npm or yarn
- Git
- Cloudinary account (optional, for image uploads)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Bryvn01/EasyCart.git
cd EasyCart
```

### 2. Backend Setup (Node.js)
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Cloudinary credentials
# Set CLOUDINARY_URL for image uploads (get from your Cloudinary dashboard)

# Start the server
npm start
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env to point to backend (http://localhost:5000)

# Start development server
npm start
```

### 4. Admin Dashboard Setup
```bash
cd admin-dashboard
npm install

# Start admin dashboard
npm start
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Admin Dashboard: http://localhost:3001 (or configured port)

## 📁 Project Structure

```
EasyCart/
├── backend/                    # Node.js/Express API
│   ├── controllers/            # Business logic
│   │   └── productController.js
│   ├── models/                 # Mongoose schemas
│   │   ├── Product.js          # Enhanced product model
│   │   ├── User.js
│   │   └── Category.js
│   ├── routes/                 # API routes
│   │   ├── products.js
│   │   ├── upload.js
│   │   ├── auth.js
│   │   └── categories.js
│   ├── middleware/             # Auth & validation
│   │   └── auth.js
│   ├── utils/                  # Utilities
│   │   ├── cloudinary.js       # Image upload
│   │   └── imageUpload.js      # Image processing
│   ├── socket.js               # Real-time features
│   ├── server.js               # Entry point
│   └── package.json
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context
│   │   └── services/       # API services
│   └── package.json
├── admin-dashboard/            # Admin React app
│   ├── src/
│   │   ├── pages/             # Admin pages
│   │   ├── services/          # API services
│   │   └── components/
│   └── package.json
├── ENHANCED_PRODUCT_API_GUIDE.md          # API documentation
├── ADMIN_DASHBOARD_INTEGRATION_GUIDE.md   # Integration guide
├── DJANGO_DEPRECATION_NOTICE.md           # Migration info
├── IMPLEMENTATION_COMPLETE_SUMMARY.md     # Overview
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/easycart
# Or MongoDB Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/easycart

# Authentication
JWT_SECRET=<your_jwt_secret>

# Cloudinary (for image uploads)
# Option 1: Use CLOUDINARY_URL (recommended for deployment)
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>

# Option 2: Use individual credentials (alternative)
# CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
# CLOUDINARY_API_KEY=<your_cloudinary_api_key>
# CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>

# CORS
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Admin Dashboard (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📚 API Documentation

### Quick Reference

**Product Endpoints:**
- `GET /api/products` - List products with filtering
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `PATCH /api/products/:id/stock` - Update stock (admin)

**Image Upload:**
- `POST /api/upload/image` - Upload single image (admin)
- `POST /api/upload/images` - Upload multiple images (admin)

**Inventory:**
- `GET /api/products/inventory/low-stock` - Low stock products
- `GET /api/products/inventory/out-of-stock` - Out of stock products

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (auth required)

For complete API documentation, see [ENHANCED_PRODUCT_API_GUIDE.md](ENHANCED_PRODUCT_API_GUIDE.md)

## 🧪 Testing

```bash
# Verify backend syntax
cd backend
node -c server.js
node -c models/Product.js
node -c controllers/productController.js

# Start backend for testing
npm start

# Test API endpoints
curl http://localhost:5000/api/products
curl http://localhost:5000/api/health

# Frontend tests
cd frontend
npm test

# Admin dashboard tests
cd admin-dashboard
npm test
```

## 📦 Deployment

### Render.com Deployment

**Backend:**
1. Create new Web Service on Render
2. Connect GitHub repository
3. Build Command: `cd backend && npm install`
4. Start Command: `cd backend && npm start`
5. Add environment variables in Render Dashboard:
   - `PORT` (e.g., 5000)
   - `MONGO_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET` (strong random string)
   - `CLOUDINARY_URL` (cloudinary://api_key:api_secret@cloud_name)
   - `FRONTEND_URL` (your frontend URL)
   
   **Note**: For Cloudinary, you can use either:
   - `CLOUDINARY_URL` (single connection string - recommended)
   - Or individual variables: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**Frontend:**
1. Create new Static Site on Render
2. Build Command: `cd frontend && npm install && npm run build`
3. Publish Directory: `frontend/build`

**Admin Dashboard:**
1. Create new Static Site on Render
2. Build Command: `cd admin-dashboard && npm install && npm run build`
3. Publish Directory: `admin-dashboard/build`

See deployment guides for detailed instructions.

## 🔄 Migration from Django

If you're migrating from the old Django backend:

1. **Read**: [DJANGO_DEPRECATION_NOTICE.md](DJANGO_DEPRECATION_NOTICE.md)
2. **Export data**: Use Django's dumpdata if needed
3. **Import to MongoDB**: Create migration script or manually re-create products
4. **Update frontend**: Already configured for Node.js backend
5. **Test thoroughly**: Ensure all features work

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

- Never commit `.env` files
- Use strong secret keys in production
- Enable HTTPS in production
- Regularly update dependencies

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.

### 🔍 Troubleshooting

If you're experiencing issues with product/category loading or other errors:

1. Check the [Frontend Error Handling Guide](FRONTEND_ERROR_HANDLING_GUIDE.md) for detailed diagnostics
2. Review error messages in browser console (F12)
3. Verify API endpoint configuration
4. Check backend service status if deployed
5. Ensure CORS settings are correct

**Common Issues:**
- **"Network error"** - Check API URL and backend availability
- **"CORS policy error"** - Verify frontend URL in backend CORS settings
- **"Server error"** - Check backend logs for details

See [FRONTEND_ERROR_HANDLING_GUIDE.md](FRONTEND_ERROR_HANDLING_GUIDE.md) for complete troubleshooting steps.

---

**Note**: This is a demo application. For production use, ensure proper security configurations and testing.