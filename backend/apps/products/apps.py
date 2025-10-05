from django.apps import AppConfig
import logging
import os

logger = logging.getLogger(__name__)

class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.products'
    
    def ready(self):
        """Initialize MongoDB connection on app startup."""
        # Skip MongoDB check if running tests or migrations
        if any(arg in ['test', 'migrate', 'makemigrations', 'check'] for arg in os.sys.argv):
            logger.info("⏭️  Skipping MongoDB check (running Django command)")
            return
        
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
                logger.warning(f"⚠️  MongoDB connection not available: {mongo_status.get('error')}")
                logger.warning(f"   API endpoints will return errors until MongoDB is configured")
                
        except Exception as e:
            logger.warning(f"⚠️  MongoDB initialization skipped: {str(e)}")
            logger.warning(f"   Set MONGO_URI environment variable to enable MongoDB features")
