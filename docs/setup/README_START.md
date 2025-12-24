# 🚀 START YOUR EASYCART APPLICATION

## ⚡ Two Simple Commands

### Terminal 1: Backend
```powershell
cd C:\EasyCart\backend
python manage.py runserver
```
✅ Backend at: http://127.0.0.1:8000

### Terminal 2: Frontend
```powershell
cd C:\EasyCart\frontend
npm start
```
✅ Frontend at: http://localhost:3000

---

## ✅ Success! You Should See:

- 🛒 Homepage with 37 products from PostgreSQL
- 🏷️ 10 categories (Bakery, Beverages, Dairy, etc.)
- 🔍 Working search and filters
- 📄 Product details
- 🎨 Responsive design

---

## 🔍 Quick Tests

1. **API Test**: http://127.0.0.1:8000/api/products/ (should show JSON)
2. **Admin Panel**: http://127.0.0.1:8000/admin/ (login with username: `admin`)
3. **Frontend**: http://localhost:3000 (should show products)

---

## 🐛 Problems?

### Frontend won't compile:
```powershell
cd C:\EasyCart\frontend
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
npm start
```

### Port already in use:
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### No data showing:
- Check both servers are running
- Open browser DevTools (F12) → Network tab
- Should see requests to localhost:8000

---

## 📖 Full Documentation

- `FULLSTACK_COMPLETE.md` - Complete guide
- `ARCHITECTURE_VISUAL.md` - System architecture
- `backend/test_api.py` - Test script

---

## ✅ Status: READY FOR DEVELOPMENT

**Your e-commerce platform with PostgreSQL is fully operational! 🎉**
