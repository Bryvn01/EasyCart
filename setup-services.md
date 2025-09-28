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

## 4. Render Deployment ✅

**Current Status**: EasyCart is deployed on Render with all services running.

### Live Applications:
- **Frontend**: [https://easycart-frontend-zge5.onrender.com](https://easycart-frontend-zge5.onrender.com)
- **Backend API**: [https://easycart-backend-0u8r.onrender.com](https://easycart-backend-0u8r.onrender.com)
- **Admin Dashboard**: [https://easycart-admin.onrender.com](https://easycart-admin.onrender.com)

### Deploy Your Own:
For complete deployment instructions, see [RENDER_DEPLOY.md](RENDER_DEPLOY.md)

## 5. Environment Variables

### Frontend & Admin Settings:
- REACT_APP_FIREBASE_API_KEY
- REACT_APP_FIREBASE_AUTH_DOMAIN
- REACT_APP_FIREBASE_PROJECT_ID
- REACT_APP_POSTHOG_KEY
- REACT_APP_API_URL=https://easycart-backend-0u8r.onrender.com/api
- REACT_APP_CHAT_URL

### Backend Settings:
- MONGODB_URI
- JWT_SECRET
- NODE_ENV=production

## 6. Test Live Deployment
```bash
# Seed database
curl -X POST https://easycart-backend-0u8r.onrender.com/api/seed

# Test API
curl https://easycart-backend-0u8r.onrender.com/api/health

# Test frontend
https://easycart-frontend-zge5.onrender.com

# Test admin
https://easycart-admin.onrender.com/admin/login
```