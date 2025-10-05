from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.products'
    
    def ready(self):
        """Initialize MongoDB connection on app startup."""
        try:
            from .mongodb_utils import check_mongodb_connection
            
            # Log MongoDB connection status on startup
            mongo_status = check_mongodb_connection()
            
            if mongo_status.get('status') == 'connected':
                logger.info(f"🚀 MongoDB Atlas connected successfully!")
                logger.info(f"   Database: {mongo_status.get('database')}")
                logger.info(f"   MongoDB Version: {mongo_status.get('mongodb_version')}")
                logger.info(f"   Products Count: {mongo_status.get('products_count')}")
            else:
                logger.error(f"❌ MongoDB connection failed: {mongo_status.get('error')}")
                raise Exception(f"MongoDB connection failed: {mongo_status.get('error')}")
                
        except Exception as e:
            logger.error(f"❌ Failed to initialize MongoDB: {str(e)}")
            # Re-raise to make it clear that the application cannot start properly
            raise
