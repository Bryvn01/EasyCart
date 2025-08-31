# EasyCart - E-Commerce Web Application

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)

A complete e-commerce solution with React frontend, Django REST API backend, and comprehensive product management.

## 🚀 Features

- **User Authentication**: JWT-based registration and login
- **Product Catalog**: Browse products by categories with search and filtering
- **Shopping Cart**: Add/remove items with real-time updates
- **Order Management**: Complete checkout process with order tracking
- **Admin Dashboard**: Product and order management interface
- **Wishlist**: Save favorite products
- **Reviews & Ratings**: Product review system
- **Responsive Design**: Mobile-first responsive UI

## 🛠️ Tech Stack

**Frontend:**
- React 18+ with Hooks
- Context API for state management
- CSS3 with responsive design
- Axios for API calls

**Backend:**
- Django 4+ with REST Framework
- JWT Authentication
- SQLite/MySQL database support
- Redis caching (optional)
- Celery for background tasks

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/easycart.git
cd easycart
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env if needed

# Start development server
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

## 📁 Project Structure

```
easycart/
├── backend/                 # Django REST API
│   ├── apps/
│   │   ├── accounts/       # User authentication
│   │   ├── products/       # Product management
│   │   └── orders/         # Order processing
│   ├── ecommerce/          # Django settings
│   └── requirements.txt
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context
│   │   └── services/       # API services
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` files and configure:

**Backend (.env):**
- `SECRET_KEY`: Django secret key
- `DEBUG`: Development mode (True/False)
- `DATABASE_URL`: Database connection string
- `ALLOWED_HOSTS`: Comma-separated allowed hosts

**Frontend (.env):**
- `REACT_APP_API_URL`: Backend API URL

## 🧪 Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

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

---

**Note**: This is a demo application. For production use, ensure proper security configurations and testing.