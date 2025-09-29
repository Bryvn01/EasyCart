# EasyCart Admin Dashboard Setup Guide

## Quick Setup (5 minutes)

### 1. Prerequisites
```bash
# Ensure you have Node.js 16+ installed
node --version  # Should be 16.x or higher
npm --version   # Should be 8.x or higher
```

### 2. Install Dependencies
```bash
cd admin-dashboard
npm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

Required environment variables:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_UPLOAD_URL=http://localhost:5000/uploads
```

### 4. Start Development Server
```bash
npm start
```

Dashboard will be available at: `http://localhost:3000/admin`

## Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
```bash
# Serve locally to test
npm run serve

# Deploy to Render/Netlify/S3
# Upload the 'build' folder or connect to Render for automatic deployment
```

## Features Available

✅ **Complete Product Management**
- Add, edit, delete products
- Bulk operations (select multiple, bulk delete)
- Image upload with preview
- Search and filter products
- Pagination for large datasets
- Export to CSV

✅ **Category Management**
- Add, edit, delete categories
- Automatic integration with product forms

✅ **Advanced Features**
- Responsive design (mobile, tablet, desktop)
- Accessibility compliance (WCAG 2.1)
- Error boundaries and graceful error handling
- Loading states and user feedback
- Demo data fallback when API unavailable

## Troubleshooting

### Common Issues

**"Cannot connect to API"**
- Ensure backend server is running
- Check `REACT_APP_API_URL` in `.env`
- Verify CORS is configured on backend

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Images Not Loading**
- Check image URLs are accessible
- Verify upload endpoint is working
- Images have fallback placeholders

## Support

- 📖 Full documentation: `ADMIN_DASHBOARD_COMPREHENSIVE_GUIDE.md`
- 🐛 Report issues: GitHub Issues
- 💬 Get help: Contact support team

**Setup Time**: ~5 minutes  
**Browser Support**: Chrome, Firefox, Safari, Edge (latest 2 versions)  
**Mobile Support**: ✅ Fully responsive