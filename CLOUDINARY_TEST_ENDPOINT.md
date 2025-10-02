# Cloudinary Test Endpoint Implementation

## Summary

Added a temporary test endpoint to confirm Cloudinary integration in the Django backend.

## Changes Made

### 1. Added Cloudinary to Dependencies

**File:** `backend/requirements.txt`

Added:
```
cloudinary>=1.36,<2.0
```

### 2. Created Test View Function

**File:** `backend/ecommerce/views.py` (new file)

```python
from django.http import JsonResponse
import cloudinary.uploader


def test_cloudinary(request):
    """
    Temporary test endpoint to verify Cloudinary integration.
    TODO: REMOVE THIS ROUTE AFTER TESTING - This is for development/testing only.
    """
    try:
        # Upload a sample image from a public URL
        result = cloudinary.uploader.upload(
            "https://upload.wikimedia.org/wikipedia/commons/3/36/Maasai_Market_Nairobi.jpg"
        )
        
        return JsonResponse({
            "secure_url": result.get("secure_url")
        })
    except Exception as e:
        return JsonResponse({
            "error": str(e)
        }, status=500)
```

### 3. Wired the View into URL Configuration

**File:** `backend/ecommerce/urls.py`

Added import:
```python
from .views import test_cloudinary
```

Added route:
```python
# TODO: REMOVE THIS ROUTE AFTER TESTING - Temporary Cloudinary test endpoint
path('api/test-cloudinary/', test_cloudinary, name='test-cloudinary'),
```

## Usage

### Prerequisites

Set the `CLOUDINARY_URL` environment variable with your Cloudinary credentials:

```bash
export CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

Or in your `.env` file:
```
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

### Testing the Endpoint

After deployment, visit:
```
https://your-domain.com/api/test-cloudinary/
```

Or test locally:
```bash
curl http://localhost:8000/api/test-cloudinary/
```

### Expected Response

**Success (with valid Cloudinary credentials):**
```json
{
  "secure_url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1690000000/xxxxx.jpg"
}
```

**Error (without credentials):**
```json
{
  "error": "Must supply api_key"
}
```

## Code Quality

- ✅ Uses Django's `JsonResponse` for the response
- ✅ Minimal and production-safe code
- ✅ Clear comments reminding to remove after testing
- ✅ Error handling included
- ✅ Does not break existing routes

## Reminder

⚠️ **IMPORTANT:** This is a temporary test endpoint. Remove it after confirming Cloudinary integration works:

1. Delete `backend/ecommerce/views.py` or remove the `test_cloudinary` function
2. Remove the route from `backend/ecommerce/urls.py`
3. (Optional) Remove `cloudinary` from `requirements.txt` if not used elsewhere

## Installation

To install dependencies including Cloudinary:

```bash
cd backend
pip install -r requirements.txt
```

## Verification

The endpoint was tested and confirmed to:
- ✅ Be properly registered in Django's URL patterns
- ✅ Return appropriate error messages when Cloudinary credentials are missing
- ✅ Not interfere with existing routes
- ✅ Follow Django best practices

## Next Steps

1. Set your `CLOUDINARY_URL` environment variable
2. Deploy the application
3. Test the endpoint from your phone or browser
4. Once confirmed working, remove the test endpoint as per comments
