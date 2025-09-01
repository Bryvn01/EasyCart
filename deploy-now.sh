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
echo "🔗 Frontend: https://easy-cart-obsc.vercel.app/"
echo "🔗 Backend: https://easycart-api-bryvn01.vercel.app/"
echo ""
echo "🧪 Test Admin Login:"
echo "Email: admin@easycart.com"
echo "Password: admin123"
echo "URL: https://easy-cart-obsc.vercel.app/admin/manage"
echo ""
echo "📊 Seed Database:"
echo "curl -X POST https://easycart-api-bryvn01.vercel.app/api/seed"