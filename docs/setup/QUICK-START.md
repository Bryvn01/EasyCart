# Quick Start Guide 🚀

## For Developers

### First Time Setup
```bash
# 1. Clone
git clone https://github.com/Bryvn01/EasyCart.git
cd EasyCart

# 2. Backend
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_products
python manage.py createsuperuser

# 3. Frontend
cd ../frontend
npm ci
npm start

# 4. Verify
# Backend: http://localhost:8000/api/health/
# Frontend: http://localhost:3000
```

### Daily Development
```bash
# Start backend
cd backend && .venv\Scripts\activate && python manage.py runserver

# Start frontend (new terminal)
cd frontend && npm start
```

### Before Committing
```bash
# Run tests
cd backend && python manage.py test
cd frontend && npm test -- --watchAll=false

# Verify CI
scripts\verify-ci.bat  # Windows
bash scripts/verify-ci.sh  # Unix
```

## For DevOps

### CI/CD Status
- **Workflows**: `.github/workflows/`
- **Required**: `required-checks.yml` must pass
- **Full Pipeline**: `ci.yml` runs on all branches

### Deployment
```bash
# Auto-deploys on push to main
git push origin main

# Monitor
# GitHub Actions: https://github.com/Bryvn01/EasyCart/actions
# Render: https://dashboard.render.com
```

### Troubleshooting
```bash
# Check logs
# GitHub Actions → Failed workflow → View logs
# Render → Service → Logs

# Common fixes
npm ci --force  # Clear npm cache
pip install -r requirements.txt --upgrade  # Update deps
python manage.py migrate  # Run migrations
```

## For QA

### Test Environments
- **Local**: http://localhost:3000
- **Staging**: (Configure in Render)
- **Production**: https://easycart-frontend-wj9x.onrender.com

### Test Checklist
- [ ] Products load
- [ ] Add to cart works
- [ ] Login/Register works
- [ ] Admin dashboard accessible
- [ ] Images display correctly
- [ ] Mobile responsive
- [ ] No console errors

### Report Issues
1. Check browser console (F12)
2. Note steps to reproduce
3. Open GitHub issue with details

## Quick Commands

### Backend
```bash
python manage.py test              # Run tests
python manage.py migrate           # Run migrations
python manage.py createsuperuser   # Create admin
python manage.py seed_products     # Seed database
python manage.py runserver         # Start server
```

### Frontend
```bash
npm ci                    # Install dependencies
npm start                 # Start dev server
npm test                  # Run tests
npm run build             # Build for production
npm run lint              # Lint code
```

### Git
```bash
git checkout -b feature/name  # New branch
git add .                     # Stage changes
git commit -m "message"       # Commit
git push origin feature/name  # Push
```

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=<your_django_secret_key>
DEBUG=True
DB_NAME=easycart
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000/api
```

## Useful Links
- **Repo**: https://github.com/Bryvn01/EasyCart
- **Issues**: https://github.com/Bryvn01/EasyCart/issues
- **Actions**: https://github.com/Bryvn01/EasyCart/actions
- **Docs**: See README.md, CONTRIBUTING.md

---

**Need Help?** Check CONTRIBUTING.md or open an issue!
