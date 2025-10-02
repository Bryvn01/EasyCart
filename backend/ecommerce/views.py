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
