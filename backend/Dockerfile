FROM python:3.12

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy project files
COPY . .

# Collect static files (if needed)
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Run Gunicorn (Render handles SSL/TLS at the edge)
CMD ["gunicorn", "ecommerce.wsgi:application", "--bind", "0.0.0.0:8000"]
