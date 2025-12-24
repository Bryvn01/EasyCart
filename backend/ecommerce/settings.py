# Allow test client host
from django.core.exceptions import ImproperlyConfigured
from decouple import UndefinedValueError
from sentry_sdk.integrations.django import DjangoIntegration
import dj_database_url
import sentry_sdk
import logging
from datetime import timedelta
from decouple import Config, RepositoryEnv, Csv
from pathlib import Path
import sys
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load config from .env file if it exists, otherwise use environment variables
env_file = BASE_DIR / ".env"
if env_file.exists():
    config = Config(RepositoryEnv(env_file))
else:
    # On Render and production, use environment variables directly
    from decouple import config

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
    "apps.core",  # Core protection system - MUST BE FIRST
    "apps.accounts",
    "apps.products",
    "apps.orders",
    "apps.payments",
    "apps.support",
    "apps.pos",
]

# Cloudinary storage configuration
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": config("CLOUDINARY_CLOUD_NAME", default="test-cloud"),
    "API_KEY": config("CLOUDINARY_API_KEY", default="test-key"),
    "API_SECRET": config("CLOUDINARY_API_SECRET", default="test-secret"),
}
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "apps.core.middleware.DomainLockMiddleware",  # Prevent unauthorized domains
    "apps.core.middleware.BrandingMiddleware",  # Add copyright headers
    "ecommerce.correlation_middleware.CorrelationIDMiddleware",  # Request tracing
    "ecommerce.middleware.DatabaseRetryMiddleware",  # Handle transient DB errors
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "ecommerce.middleware.DisableCSRFForAPIMiddleware",  # Disable CSRF for /api/* endpoints
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "apps.core.middleware.AuditLogMiddleware",  # Audit superadmin actions
    "apps.core.middleware.LicenseEnforcementMiddleware",  # Enforce license restrictions
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "simple_history.middleware.HistoryRequestMiddleware",
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

# Authentication Backends
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",  # Default backend for email-based auth
]

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
# Support both DATABASE_URL (Render) and individual env vars (local dev)
# Try DATABASE_URL first (production), fall back to individual vars (local)
database_url = config("DATABASE_URL", default=None)

if database_url:
    # Production: Use DATABASE_URL from Render
    # For Railway free tier: Use shorter connection pooling to handle sleeping DB
    conn_max_age = 0 if "railway" in database_url.lower() else 600

    DATABASES = {
        "default": dj_database_url.parse(
            database_url,
            conn_max_age=conn_max_age,
            conn_health_checks=True,
            ssl_require=True,
        )
    }
    # PostgreSQL-specific production options for Railway
    DATABASES["default"]["OPTIONS"] = {
        "connect_timeout": 30,  # Increased for Railway cold starts
        "options": "-c statement_timeout=60000 -c idle_in_transaction_session_timeout=60000",
        # TCP keepalive for long-running connections (prevents firewall timeouts)
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
        # Application-level settings
        "application_name": "easycart_backend",
    }
    # Add retry configuration for initial connection
    DATABASES["default"]["CONN_HEALTH_CHECKS"] = True
    DATABASES["default"][
        "DISABLE_SERVER_SIDE_CURSORS"
    ] = True  # Better for connection pooling
else:
    # Local development: Use individual environment variables
    DATABASES = {
        "default": {
            "ENGINE": config("DB_ENGINE"),
            "NAME": config("DB_NAME"),
            "USER": config("DB_USER"),
            "PASSWORD": config("DB_PASSWORD"),
            "HOST": config("DB_HOST"),
            "PORT": config("DB_PORT"),
            "CONN_MAX_AGE": 0,  # No pooling for Railway free tier
            "CONN_HEALTH_CHECKS": True,  # Enable connection health checks
            # Only add OPTIONS for MySQL
            "OPTIONS": (
                {
                    "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
                    "charset": "utf8mb4",
                }
                if config("DB_ENGINE").endswith("mysql")
                else (
                    {
                        # PostgreSQL-specific connection options
                        "connect_timeout": 10,  # Connection timeout in seconds
                        "options": "-c statement_timeout=30000",  # 30 second query timeout
                    }
                    if config("DB_ENGINE").endswith("postgresql")
                    else {}
                )
            ),
            # Add automatic retry on startup for Railway free tier
            "ATOMIC_REQUESTS": False,  # Explicit transactions for better error handling
        }
    }
    # Enhanced connection settings for Railway free tier (sleeps after 15min)
    if config("DB_ENGINE").endswith("postgresql"):
        DATABASES["default"]["OPTIONS"]["keepalives"] = 1
        DATABASES["default"]["OPTIONS"]["keepalives_idle"] = 30
        DATABASES["default"]["OPTIONS"]["keepalives_interval"] = 10
        DATABASES["default"]["OPTIONS"]["keepalives_count"] = 5

# Password validation
# Updated to 12 characters minimum (NIST 800-63B 2025 guidelines)
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {
            "min_length": 12,
        },
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
    {
        "NAME": "apps.accounts.pwned_passwords_validator.PwnedPasswordsValidator",
        "OPTIONS": {
            "threshold": 1,  # Reject if password appears even once in breaches
            "api_timeout": 2,  # 2 second timeout for API requests
        },
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"

# Timezone Settings
# Set to local timezone - Django will store in UTC but display in this timezone
TIME_ZONE = "Africa/Nairobi"  # East Africa Time (UTC+3)
USE_I18N = True
USE_TZ = True  # Enable timezone support (MUST be True)

# This makes Django admin and APIs display times in local timezone (EAT)
# Database still stores in UTC (Django handles conversion automatically)
USE_L10N = True  # Enable localized formatting

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
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    # Global throttling configuration
    "DEFAULT_THROTTLE_CLASSES": [
        "apps.throttling.BurstRateThrottle",
        "apps.throttling.SustainedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
        "burst": "60/min",
        "sustained": "1000/hour",
        "payment": "10/min",
        "otp": "5/hour",
        "login": "5/5min",
        "registration": "3/hour",
        "strict_anon": "100/hour",
        "progressive": "100/min",
    },
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
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
    default=(
        "https://easycart-frontend-wj9x.onrender.com,"
        "https://easycart-admin-08xf.onrender.com,"
        "http://localhost:3000,"
        "http://localhost:3001,"
        "http://127.0.0.1:3001,"
        "https://easycart-backend-2k8l.onrender.com"
    ),
    cast=Csv(),
)
# Example for local/dev:
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",  # Main frontend
#     "http://127.0.0.1:3000",
#     "http://localhost:3001",  # Admin dashboard
#     "http://127.0.0.1:3001",
#     "https://easycart-frontend-wj9x.onrender.com",
#     "https://easycart-admin-08xf.onrender.com"
# ]

CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ["Content-Type", "X-CSRFToken"]

# Frontend URL for email verification links
FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:3000")

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

# CSRF Settings for JWT API
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",  # Admin dashboard
    "http://127.0.0.1:3001",
    "https://easycart-frontend-wj9x.onrender.com",
    "https://easycart-admin-08xf.onrender.com",
]
# Exempt API endpoints from CSRF (handled by middleware)
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript to read CSRF cookie if needed
CSRF_USE_SESSIONS = False  # Don't tie CSRF to sessions (we use JWT)

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
REDIS_URL = config("REDIS_URL", default=None)

# Use Redis cache if available, otherwise use dummy cache
if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                "IGNORE_EXCEPTIONS": True,  # Don't crash if Redis is down
                "SOCKET_CONNECT_TIMEOUT": 1,  # Faster timeout
                "SOCKET_TIMEOUT": 1,
                "CONNECTION_POOL_KWARGS": {"max_connections": 50},
            },
            "KEY_PREFIX": "easycart",
            "TIMEOUT": 300,  # 5 minutes default
        }
    }
    # Use Redis for sessions when available
    SESSION_ENGINE = "django.contrib.sessions.backends.cache"
    SESSION_CACHE_ALIAS = "default"
else:
    # Fall back to local memory cache (for development/Render free tier)
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "easycart-cache",
        }
    }
    # Use database sessions when Redis is not available
    SESSION_ENGINE = "django.contrib.sessions.backends.db"

# Health Check Thresholds (ms)
# Used by utils.health_checks to classify dependencies as healthy/degraded/unhealthy.
HEALTHCHECK_DB_DEGRADED_MS = config("HEALTHCHECK_DB_DEGRADED_MS", default=250, cast=int)
HEALTHCHECK_DB_UNHEALTHY_MS = config(
    "HEALTHCHECK_DB_UNHEALTHY_MS", default=2000, cast=int
)
HEALTHCHECK_CACHE_DEGRADED_MS = config(
    "HEALTHCHECK_CACHE_DEGRADED_MS", default=250, cast=int
)
HEALTHCHECK_CACHE_UNHEALTHY_MS = config(
    "HEALTHCHECK_CACHE_UNHEALTHY_MS", default=10000, cast=int
)

# Health check behavior
HEALTHCHECK_CACHE_ENABLED = config(
    "HEALTHCHECK_CACHE_ENABLED", default=bool(REDIS_URL), cast=bool
)
HEALTHCHECK_CACHE_LOG_COOLDOWN_S = config(
    "HEALTHCHECK_CACHE_LOG_COOLDOWN_S", default=60, cast=int
)

SESSION_COOKIE_AGE = 604800  # 7 days
SESSION_SAVE_EVERY_REQUEST = False  # Only save when modified

# Email Configuration
# For production, use SMTP backend and configure credentials:
# EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
# EMAIL_HOST=smtp.gmail.com (or your provider)
# EMAIL_HOST_USER=your-email@gmail.com
# EMAIL_HOST_PASSWORD=your-app-password
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

# Support Configuration
SUPPORT_EMAIL = config("SUPPORT_EMAIL", default="support@ecommerce.com")
SITE_URL = config("SITE_URL", default="http://127.0.0.1:8000")

# Twilio Configuration for WhatsApp/SMS OTP delivery
# Get credentials from https://console.twilio.com
# TWILIO_ACCOUNT_SID=your_account_sid
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_PHONE_NUMBER=+1234567890 (your Twilio number)
# TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890 (optional, for WhatsApp)
TWILIO_ACCOUNT_SID = config("TWILIO_ACCOUNT_SID", default="")
TWILIO_AUTH_TOKEN = config("TWILIO_AUTH_TOKEN", default="")
TWILIO_PHONE_NUMBER = config("TWILIO_PHONE_NUMBER", default="")
TWILIO_WHATSAPP_NUMBER = config("TWILIO_WHATSAPP_NUMBER", default="")

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
    "filters": {
        "suppress_deprecated": {
            "()": "django.utils.log.CallbackFilter",
            "callback": lambda record: "Components object is deprecated"
            not in record.getMessage(),
        },
        "pii_masking": {
            "()": "utils.logging_filters.PIIMaskingFilter",
        },
        "correlation_id": {
            "()": "utils.logging_filters.CorrelationIDFilter",
        },
        "sensitive_data": {
            "()": "utils.logging_filters.SensitiveDataFilter",
        },
    },
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} [{correlation_id}] {module} {process:d} {thread:d} {message}",
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
            "filters": ["pii_masking", "correlation_id", "sensitive_data"],
        },
        "console": {
            "level": "DEBUG" if DEBUG else "INFO",
            "class": "logging.StreamHandler",
            "formatter": "simple",
            "filters": ["suppress_deprecated", "pii_masking", "sensitive_data"],
        },
        "audit": {
            "level": "INFO",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOG_DIR / "audit.log",
            "maxBytes": 1024 * 1024 * 50,  # 50 MB for audit logs
            "backupCount": 10,
            "formatter": "verbose",
            "filters": [
                "correlation_id"
            ],  # Audit logs need correlation but minimal masking
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
        "audit": {
            "handlers": ["audit"],
            "level": "INFO",
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


# M-Pesa Payment Gateway Configuration
MPESA_ENVIRONMENT = get_env_var("MPESA_ENVIRONMENT", default="sandbox", required=False)
MPESA_CONSUMER_KEY = get_env_var("MPESA_CONSUMER_KEY", default="", required=False)
MPESA_CONSUMER_SECRET = get_env_var("MPESA_CONSUMER_SECRET", default="", required=False)
MPESA_SHORTCODE = get_env_var("MPESA_SHORTCODE", default="174379", required=False)
MPESA_PASSKEY = get_env_var("MPESA_PASSKEY", default="", required=False)
MPESA_CALLBACK_URL = get_env_var("MPESA_CALLBACK_URL", default="", required=False)

# Webhook signature verification (recommended for production)
MPESA_VERIFY_SIGNATURES = get_env_var(
    "MPESA_VERIFY_SIGNATURES", default="True", required=False
).lower() in ("true", "1", "yes")
MPESA_WEBHOOK_SECRET = get_env_var("MPESA_WEBHOOK_SECRET", default="", required=False)

# Production validation
if MPESA_ENVIRONMENT == "production" and not DEBUG:
    if not MPESA_CONSUMER_KEY or not MPESA_CONSUMER_SECRET:
        logging.warning(
            "M-Pesa production mode enabled but credentials not configured!"
        )
    if MPESA_VERIFY_SIGNATURES and not MPESA_WEBHOOK_SECRET:
        logging.warning(
            "M-Pesa signature verification enabled but webhook secret not set!"
        )

# Development CORS override
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True

# Silence Django admin CSS warnings
SILENCED_SYSTEM_CHECKS = [
    "admin.W411",  # Suppress admin CSS warnings
]
