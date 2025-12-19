# Cloudinary configuration for Django
# flake8: noqa
# Avoid WMI timeout issues on Windows by disabling platform detection
import os

os.environ.setdefault("PROCESSOR_IDENTIFIER", "GenericProcessor")

import cloudinary
import cloudinary.uploader
from decouple import config

CLOUDINARY_STORAGE = {
    "CLOUD_NAME": config("CLOUDINARY_CLOUD_NAME", default="test-cloud"),
    "API_KEY": config("CLOUDINARY_API_KEY", default="test-key"),
    "API_SECRET": config("CLOUDINARY_API_SECRET", default="test-secret"),
}

DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
