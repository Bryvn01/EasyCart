# EasyCart Backend

Primary backend implementation is Django + Django REST Framework.

## Quick start

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

## Tests

```bash
python manage.py test --verbosity=2 --keepdb
```

## Notes

- Main settings: `backend/ecommerce/settings.py`
- Main URL config: `backend/ecommerce/urls.py`
- Environment template: `backend/.env.example`
- Legacy Node/Express files exist in this folder (`server.js`, `package.json`) but CI workflows validate the Django backend path.
