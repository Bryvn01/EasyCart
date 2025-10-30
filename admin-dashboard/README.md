
# EasyCart Admin Dashboard (2025)

Modern, responsive admin dashboard for managing the EasyCart e-commerce platform.


## Features

- **Superadmin CRUD**: Full CRUD for products, categories, and orders via new admin endpoints
- **Bulk Actions**: Bulk delete, update stock, inline editing
- **Role Management**: Assign/change roles (superadmin/manager only), audit-logged
- **Admin/Frontend Sync**: All admin actions are instantly reflected in the frontend
- **Secure Authentication**: JWT-based, role-based access control for all admin endpoints
- **Dashboard Overview**: Key metrics and recent orders
- **Product Management**: Full CRUD, bulk actions, image upload/URL
- **Order Management**: View, update, and manage order statuses
- **User Management**: View, manage, and assign roles
- **Reports & Analytics**: Business performance metrics

## Tech Stack

- React 18
- React Router v6
- Tailwind CSS
- Axios for API calls
- Lucide React for icons
- React Hot Toast for notifications

## Getting Started

1. **Install Dependencies**
   ```bash
   cd admin-dashboard
   npm install
   ```

2. **Environment Setup**
   Create `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Access Admin Dashboard**
   - URL: http://localhost:3001/admin/login
   - Demo Login: admin@easycart.com / admin123

## Project Structure

```
admin-dashboard/
├── src/
│   ├── components/
│   │   ├── Layout.js          # Main layout with sidebar
│   │   └── ProtectedRoute.js  # Route protection
│   ├── context/
│   │   └── AuthContext.js     # Authentication state
│   ├── pages/
│   │   ├── Login.js           # Admin login
│   │   ├── Dashboard.js       # Main dashboard
│   │   ├── Products.js        # Product management
│   │   ├── Orders.js          # Order management
│   │   ├── Users.js           # User management
│   │   └── Reports.js         # Analytics
│   ├── services/
│   │   └── api.js             # API service layer
│   └── App.js                 # Main app component
├── public/
└── package.json
```


## API Integration (Admin Endpoints)

The dashboard connects to the EasyCart backend using dedicated admin endpoints:

- **Authentication**: `/api/auth/login`, `/api/auth/profile`
- **Products (Admin)**: `/api/products/admin/products/` (CRUD, bulk actions)
- **Categories (Admin)**: `/api/products/admin/categories/` (CRUD)
- **Orders (Admin)**: `/api/orders/admin/orders/` (CRUD)
- **Bulk Actions**: `/api/products/admin/products/bulk_delete/`, `/api/products/admin/products/update_stock/`
- **Users**: `/api/users` (view, manage, assign roles)
- **Dashboard**: `/api/admin/dashboard` (metrics)

All admin endpoints are protected by JWT authentication and role-based permissions. See [ADMIN_DASHBOARD_API_FIX_SUMMARY.md](../ADMIN_DASHBOARD_API_FIX_SUMMARY.md) and [ENHANCED_PRODUCT_API_GUIDE.md](../ENHANCED_PRODUCT_API_GUIDE.md) for full API details.


## Security & Compliance

- All admin endpoints require JWT authentication and enforce role-based permissions
- Superadmin/manager can assign roles; all changes are audit-logged
- CORS and secure HTTP headers enforced for all admin operations
- Automated security checks and error monitoring (Sentry)
## Documentation & Guides

- [ADMIN_DASHBOARD_GUIDE.md](../ADMIN_DASHBOARD_GUIDE.md): Admin dashboard usage
- [ADMIN_DASHBOARD_API_FIX_SUMMARY.md](../ADMIN_DASHBOARD_API_FIX_SUMMARY.md): Admin API details
- [ENHANCED_PRODUCT_API_GUIDE.md](../ENHANCED_PRODUCT_API_GUIDE.md): Product API reference
- [IMAGE_UPLOAD_GUIDE.md](../IMAGE_UPLOAD_GUIDE.md): Image upload (file & URL)
- [TESTING_GUIDE.md](../TESTING_GUIDE.md): Automated tests and coverage
- [SECURITY.md](../SECURITY.md): Security policy and known vulnerabilities

- JWT token-based authentication
- Role-based access control (admin only)
- Protected routes with automatic redirects
- Secure API communication

## Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy to Render**
   - Go to https://render.com/dashboard
   - Click "New +" → "Static Site"
   - Connect GitHub repository
   - Set root directory to `admin-dashboard`
   - Set build command to `npm run build`
   - Set publish directory to `build`
   - Add environment variables:
     ```
   REACT_APP_API_URL=https://easycart-backend-2k8l.onrender.com/api
     ```

**Live URL:** https://easycart-admin-08xf.onrender.com

## Routes

- `/admin/login` - Admin authentication
- `/admin/dashboard` - Main dashboard with metrics
- `/admin/products` - Product management (CRUD)
- `/admin/orders` - Order management and status updates
- `/admin/users` - User account management
- `/admin/reports` - Analytics and reporting