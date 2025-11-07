# Allow test client host
from django.core.exceptions import ImproperlyConfigured
from decouple import UndefinedValueError
from sentry_sdk.integrations.django import DjangoIntegration
import sentry_sdk
import logging
from datetime import timedelta
from decouple import config, Csv
from pathlib import Path
import sys
import os

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "testserver"]

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Security Settings
SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", default="False").strip().lower() in ("true", "1", "yes", "on")

# Validate production security
if not DEBUG and SECRET_KEY == "django-insecure-change-me-in-production":
    logging.critical("INSECURE SECRET_KEY IN PRODUCTION!")
    sys.exit(1)

# Sentry error monitoring (only in production)
SENTRY_DSN = config("SENTRY_DSN", default=None)
if SENTRY_DSN and not DEBUG:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.5,  # Adjust for performance monitoring
        send_default_pii=True,
    )

ALLOWED_HOSTS = config("ALLOWED_HOSTS", cast=Csv())

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party apps
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    "django_extensions",
    "sslserver",
    "simple_history",
    "cloudinary",
    "cloudinary_storage",
    # Local apps
    "apps.accounts",
    "apps.products",
    "apps.orders",
    "apps.payments",
]

# Cloudinary config for media files
try:
    from .cloudinary_config import *
except ImportError:
    pass

MIDDLEWARE = [
    "django.middleware.gzip.GZipMiddleware",  # Enable GZip compression
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "simple_history.middleware.HistoryRequestMiddleware",
    "ecommerce.middleware.PerformanceLoggingMiddleware",  # Performance monitoring
    "ecommerce.middleware.ErrorHandlingMiddleware",
]
# --- Rate Limiting ---
# Default: 100 requests per minute per IP for API endpoints
RATELIMIT_VIEW = "rest_framework.exceptions.Throttled"
RATELIMIT_ENABLE = True
RATELIMIT_CACHE = "default"
RATELIMIT_RATE = "100/m"
RATELIMIT_BLOCK = True

# --- Brute-force Protection ---
# For login endpoints, use @ratelimit(key='ip', rate='5/m', method='POST', block=True)
# See docs: https://django-ratelimit.readthedocs.io/en/stable/usage.html

# --- Audit Logging ---
# Already enabled via django-simple-history and logging config

ROOT_URLCONF = "ecommerce.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "ecommerce.wsgi.application"

# Database
DATABASES = {
    "default": {
        "ENGINE": config("DB_ENGINE"),
        "NAME": config("DB_NAME"),
        "USER": config("DB_USER"),
        "PASSWORD": config("DB_PASSWORD"),
        "HOST": config("DB_HOST"),
        "PORT": config("DB_PORT"),
        "CONN_MAX_AGE": 600,
        # Only add OPTIONS for MySQL
        "OPTIONS": (
            {
                "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
                "charset": "utf8mb4",
            }
            if config("DB_ENGINE").endswith("mysql")
            else {}
        ),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Media files
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Custom user model
AUTH_USER_MODEL = "accounts.User"

# Django REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    # Throttling disabled for development
    # 'DEFAULT_THROTTLE_CLASSES': [
    #     'rest_framework.throttling.AnonRateThrottle',
    #     'rest_framework.throttling.UserRateThrottle'
    # ],
    # 'DEFAULT_THROTTLE_RATES': {
    #     'anon': '100/hour',
    #     'user': '1000/hour',
    #     'login': '10/min',
    #     'register': '5/min',
    # },
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "EXCEPTION_HANDLER": "ecommerce.middleware.custom_exception_handler",
}

# JWT Configuration
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# CORS Settings

# === CORS: Only allow production frontends and admin dashboard ===


# === CORS: Only allow trusted frontends and admin dashboards ===
# Always keep this list minimal and explicit for security.
# Ensure both frontend URLs are allowed for CORS
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="https://easycart-frontend-wj9x.onrender.com,https://easycart-admin-08xf.onrender.com,http://localhost:3000,https://easycart-backend-2k8l.onrender.com,https://easycart-frontend-wj9x.onrender.com",
    cast=Csv(),
)
# Example for local/dev:
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "https://easycart-frontend-wj9x.onrender.com",
#     "https://easycart-admin-08xf.onrender.com"
# ]

CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ["Content-Type", "X-CSRFToken"]
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# Security Headers
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"

# SSL/HTTPS Configuration
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Cache Configuration
REDIS_URL = config("REDIS_URL", default="redis://localhost:6379/1")
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "IGNORE_EXCEPTIONS": True,  # Don't crash if Redis is down
            "SOCKET_CONNECT_TIMEOUT": 5,
            "SOCKET_TIMEOUT": 5,
            "CONNECTION_POOL_KWARGS": {"max_connections": 50},
        },
        "KEY_PREFIX": "easycart",
        "TIMEOUT": 300,  # 5 minutes default
    }
}

# Session Configuration - Use Redis for sessions
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"
SESSION_COOKIE_AGE = 604800  # 7 days
SESSION_SAVE_EVERY_REQUEST = False  # Only save when modified

# Email Configuration
EMAIL_BACKEND = config(
    "EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend"
)
EMAIL_HOST = config("EMAIL_HOST", default="")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="noreply@ecommerce.com")
SERVER_EMAIL = config("SERVER_EMAIL", default=DEFAULT_FROM_EMAIL)

# Celery Configuration
CELERY_BROKER_URL = config("CELERY_BROKER_URL", default="redis://localhost:6379/0")
CELERY_RESULT_BACKEND = config(
    "CELERY_RESULT_BACKEND", default="redis://localhost:6379/0"
)
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "UTC"
CELERY_TASK_ALWAYS_EAGER = config("CELERY_TASK_ALWAYS_EAGER", default=DEBUG, cast=bool)

# Logging Configuration
LOG_LEVEL = "DEBUG" if DEBUG else "INFO"
LOG_DIR = BASE_DIR / "logs"
os.makedirs(LOG_DIR, exist_ok=True)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "file": {
            "level": "INFO",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOG_DIR / "django.log",
            "maxBytes": 1024 * 1024 * 10,  # 10 MB
            "backupCount": 5,
            "formatter": "verbose",
        },
        "console": {
            "level": "DEBUG" if DEBUG else "INFO",
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
    },
    "root": {
        "handlers": ["console", "file"],
        "level": LOG_LEVEL,
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console", "file"],
            "level": "ERROR",
            "propagate": False,
        },
        "apps": {
            "handlers": ["console", "file"],
            "level": "DEBUG" if DEBUG else "INFO",
            "propagate": False,
        },
    },
}

# File upload limits
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5 MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5 MB
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000

# Application-specific settings
MAX_PRODUCT_IMAGES = 5
ORDER_TIMEOUT_MINUTES = 30
CART_SESSION_TIMEOUT = 604800  # 7 days in seconds

# Admin URL (for security through obscurity)
ADMIN_URL = config("ADMIN_URL", default="admin/")

# Ensure media directory exists
os.makedirs(MEDIA_ROOT, exist_ok=True)

# M-Pesa Settings


def get_env_var(var, default=None, required=False):
    try:
        return config(var)
    except UndefinedValueError:
        if required:
            raise ImproperlyConfigured(f"{var} must be set in production")
        return default


MPESA_CONSUMER_KEY = get_env_var("MPESA_CONSUMER_KEY", default="", required=False)
MPESA_CONSUMER_SECRET = get_env_var("MPESA_CONSUMER_SECRET", default="", required=False)
MPESA_SHORTCODE = get_env_var("MPESA_SHORTCODE", default="174379", required=False)
MPESA_PASSKEY = get_env_var("MPESA_PASSKEY", default="", required=False)
MPESA_CALLBACK_URL = get_env_var("MPESA_CALLBACK_URL", default="", required=False)

# Development CORS override
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
