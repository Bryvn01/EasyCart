# EasyCart Admin Dashboard

Modern, responsive admin dashboard for managing the EasyCart e-commerce platform.

## Features

- **Secure Authentication**: Role-based access control for admin users only
- **Dashboard Overview**: Key metrics and recent orders
- **Product Management**: Full CRUD operations for products
- **Order Management**: View and update order statuses
- **User Management**: View and manage user accounts
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

## API Integration

The dashboard connects to the existing EasyCart backend:

- **Authentication**: `/api/auth/login`, `/api/auth/profile`
- **Products**: `/api/products` (CRUD operations)
- **Orders**: `/api/orders` (view, update status)
- **Users**: `/api/users` (view, manage)
- **Dashboard**: `/api/admin/dashboard` (metrics)

## Security

- JWT token-based authentication
- Role-based access control (admin only)
- Protected routes with automatic redirects
- Secure API communication

## Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   - Connect GitHub repository
   - Set build directory to `admin-dashboard`
   - Add environment variables

## Routes

- `/admin/login` - Admin authentication
- `/admin/dashboard` - Main dashboard with metrics
- `/admin/products` - Product management (CRUD)
- `/admin/orders` - Order management and status updates
- `/admin/users` - User account management
- `/admin/reports` - Analytics and reporting