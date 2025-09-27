# Service Setup Instructions

## 1. Firebase Setup
1. Go to https://console.firebase.google.com
2. Create new project: "easycart-kenya"
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Enable Analytics
6. Copy config to frontend/.env

## 2. PostHog Setup
1. Go to https://app.posthog.com/signup
2. Create account and project
3. Copy API key to frontend/.env
4. Enable autocapture and session recordings

## 3. MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Create cluster: "easycart-cluster"
3. Create user: easycart / EasyCart2024
4. Whitelist all IPs: 0.0.0.0/0
5. Copy connection string to backend/.env

## 4. Render Deployment

### Backend:
```bash
# Deploy backend as Web Service
# Root Directory: backend
# Build Command: npm install
# Start Command: npm start
# Set environment variables in Render dashboard
```

### Frontend:
```bash
# Deploy frontend as Static Site
# Root Directory: frontend
# Build Command: npm run build
# Publish Directory: build
# Set environment variables in Render dashboard
```

## 5. Environment Variables

### Render Frontend Settings:
- REACT_APP_FIREBASE_API_KEY
- REACT_APP_FIREBASE_AUTH_DOMAIN
- REACT_APP_FIREBASE_PROJECT_ID
- REACT_APP_POSTHOG_KEY
- REACT_APP_API_URL
- REACT_APP_CHAT_URL

### Render Backend Settings:
- MONGODB_URI
- JWT_SECRET
- FRONTEND_URL

## 6. Test Deployment
```bash
# Seed database
curl -X POST https://easycart-backend.onrender.com/api/seed

# Test API
curl https://easycart-backend.onrender.com/api/health

# Test frontend
https://easycart-frontend.onrender.com
```