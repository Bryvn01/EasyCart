#!/bin/bash

echo "🚀 Deploying EasyCart with all fixes..."

# Build frontend
cd frontend
npm run build

# Commit and push changes
cd ..
git add .
git commit -m "fix: Admin login, health endpoint, lazy loading, and production deployment"
git push

echo "✅ Deployment complete!"
echo "🔗 Frontend: https://easycart-frontend.onrender.com/"
echo "🔗 Backend: https://easycart-backend.onrender.com/"
echo "🔗 Admin: https://easycart-admin.onrender.com/"
echo ""
echo "🧪 Test Admin Login:"
echo "Email: admin@easycart.com"
echo "Password: admin123"
echo "URL: https://easycart-admin.onrender.com/admin/manage"
echo ""
echo "📊 Seed Database:"
echo "curl -X POST https://easycart-backend.onrender.com/api/seed"