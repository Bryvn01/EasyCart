# Cloudinary configuration for Django
# Add to backend/ecommerce/settings.py and install dependencies as needed

import cloudinary
import cloudinary.uploader
import cloudinary.api
from decouple import config

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': config('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': config('CLOUDINARY_API_KEY'),
    'API_SECRET': config('CLOUDINARY_API_SECRET'),
}

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
