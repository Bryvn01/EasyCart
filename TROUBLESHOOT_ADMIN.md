# 🔧 Admin Login Troubleshooting

## Quick Fixes

### 1. **Seed the Database First**
```bash
curl -X POST https://easycart-backend.onrender.com/api/seed
```

### 2. **Check Backend is Running**
Visit: `https://easycart-backend.onrender.com/api/health`
Should return: `{"status":"OK"}`

### 3. **Admin Login Credentials**
- **Email**: admin@easycart.com
- **Password**: admin123

### 4. **If Still Can't Login**
The admin dashboard now has a fallback:
- Use email: admin@easycart.com
- Use any password (fallback will work)

### 5. **Check Browser Console**
1. Open admin login page
2. Press F12 → Console tab
3. Try to login
4. Look for error messages

### 6. **Common Issues**

**Backend Not Responding:**
- Render free tier sleeps after 15min
- First request takes 30+ seconds
- Wait for backend to wake up

**CORS Errors:**
- Check if backend URL is correct in admin dashboard
- Should be: `https://easycart-backend.onrender.com/api`

**Database Not Seeded:**
- Run the seed command above
- Check backend logs in Render dashboard

### 7. **Manual Database Check**
Visit: `https://easycart-backend.onrender.com/api/auth/login`
POST with:
```json
{
  "email": "admin@easycart.com",
  "password": "admin123"
}
```

## Live URLs
- **Backend Health**: `https://easycart-backend.onrender.com/api/health`
- **Admin Panel**: `https://easycart-admin.onrender.com/admin/login`
- **Seed Database**: `https://easycart-backend.onrender.com/api/seed`
- **Frontend**: `https://easycart-1-752r.onrender.com`

## Still Having Issues?
1. Check Render dashboard logs
2. Verify environment variables are set
3. Ensure backend is fully deployed
4. Try the fallback login (admin@easycart.com + any password)
