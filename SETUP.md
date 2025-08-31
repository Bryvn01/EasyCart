# E-Commerce App Setup Guide

## Prerequisites
- Python 3.8+
- Node.js 14+
- MySQL 8.0+
- Git

## Step 1: Database Setup

1. Install MySQL and create database:
```sql
CREATE DATABASE ecommerce_db;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
```

2. Update `.env` file in backend directory with your database credentials.

## Step 2: Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Update settings in `ecommerce/settings.py`:
- Set `AUTH_USER_MODEL = 'accounts.User'`

6. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

7. Create superuser:
```bash
python manage.py createsuperuser
```

8. Start development server:
```bash
python manage.py runserver
```

## Step 3: Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

## Step 4: Testing the Application

1. Backend API will be available at: `http://localhost:8000`
2. Frontend will be available at: `http://localhost:3000`
3. Admin panel: `http://localhost:8000/admin`

## Step 5: Adding Sample Data

1. Access Django admin panel
2. Create categories and products
3. Test user registration and login
4. Test shopping cart and checkout

## Production Deployment

### Backend (Django)
1. Set `DEBUG=False` in settings
2. Configure proper database settings
3. Set up static file serving
4. Use a production WSGI server like Gunicorn
5. Configure environment variables

### Frontend (React)
1. Build production version: `npm run build`
2. Serve static files with a web server like Nginx
3. Configure API endpoints for production

## Security Considerations

1. Change SECRET_KEY in production
2. Use HTTPS in production
3. Configure CORS properly
4. Set up proper authentication
5. Validate all user inputs
6. Use environment variables for sensitive data

## Features Implemented

- User authentication (register/login)
- Product catalog with categories
- Product search and filtering
- Shopping cart functionality
- Order management
- Responsive design
- JWT token authentication
- RESTful API design