"""
MongoDB utility functions for fetching product data from MongoDB Atlas.
This module provides helper functions to connect to MongoDB and retrieve product data
for use in Django REST Framework views.
"""

import logging
from typing import List, Dict, Optional, Any
from django.conf import settings
from pymongo import MongoClient, errors
from pymongo.collection import Collection
from bson import ObjectId

logger = logging.getLogger(__name__)


class MongoDBConnection:
    """Singleton class to manage MongoDB connection."""

    _instance = None
    _client = None
    _db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBConnection, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None:
            self._connect()

    def _connect(self):
        """Establish connection to MongoDB Atlas."""
        mongo_uri = settings.MONGO_URI

        if not mongo_uri:
            logger.error("MONGO_URI not configured in settings")
            raise ValueError("MONGO_URI environment variable is required")

        try:
            self._client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=5000,
            )
            # Test connection
            self._client.admin.command("ping")

            # Get database from URI
            self._db = self._client.get_database()

            logger.info(f"✅ MongoDB connected successfully to database: {self._db.name}")

        except errors.ConfigurationError as e:
            logger.error(f"❌ MongoDB configuration error: {str(e)}")
            raise
        except errors.ConnectionFailure as e:
            logger.error(f"❌ MongoDB connection failed: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"❌ Unexpected MongoDB error: {str(e)}")
            raise

    def get_database(self):
        """Get MongoDB database instance."""
        if self._db is None:
            self._connect()
        return self._db

    def get_collection(self, collection_name: str) -> Collection:
        """Get MongoDB collection."""
        db = self.get_database()
        return db[collection_name]

    def close(self):
        """Close MongoDB connection."""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            logger.info("MongoDB connection closed")


def get_mongodb_connection() -> MongoDBConnection:
    """Get MongoDB connection instance."""
    return MongoDBConnection()


def serialize_mongodb_doc(doc: Dict) -> Dict:
    """
    Serialize MongoDB document to JSON-serializable format.
    Converts ObjectId to string and ensures all fields are JSON-compatible.
    """
    if doc is None:
        return None

    serialized = {}
    for key, value in doc.items():
        if key == "_id":
            # Convert ObjectId to string for 'id' field
            serialized["id"] = str(value)
        elif isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, list):
            serialized[key] = [serialize_mongodb_doc(item) if isinstance(item, dict) else item for item in value]
        elif isinstance(value, dict):
            serialized[key] = serialize_mongodb_doc(value)
        else:
            serialized[key] = value

    return serialized


def get_products_from_mongodb(
    category: Optional[str] = None,
    search: Optional[str] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    ordering: str = "-createdAt",
    limit: int = 20,
    skip: int = 0,
) -> tuple[List[Dict], int]:
    """
    Fetch products from MongoDB Atlas with filtering and pagination.

    Args:
        category: Filter by category name
        search: Search in name and description
        price_min: Minimum price filter
        price_max: Maximum price filter
        ordering: Sort field (prefix with - for descending)
        limit: Number of results to return
        skip: Number of results to skip (for pagination)

    Returns:
        Tuple of (products_list, total_count)
    """
    try:
        mongo_conn = get_mongodb_connection()
        products_collection = mongo_conn.get_collection("products")

        # Build query filter
        query = {}

        # Category filter - sanitize input
        if category:
            # Validate and sanitize category to prevent injection
            safe_category = str(category)[:100].strip()
            if safe_category:
                query["category"] = safe_category

        # Search filter - sanitize regex input to prevent injection
        if search:
            import re as regex_module
            # Escape special regex characters to prevent injection
            safe_search = regex_module.escape(str(search)[:100])
            query["$or"] = [
                {"name": {"$regex": safe_search, "$options": "i"}},
                {"description": {"$regex": safe_search, "$options": "i"}},
            ]

        # Price range filter
        if price_min is not None or price_max is not None:
            query["price"] = {}
            if price_min is not None:
                query["price"]["$gte"] = price_min
            if price_max is not None:
                query["price"]["$lte"] = price_max

        # Determine sort direction and field - whitelist allowed fields
        allowed_sort_fields = {
            "name", "price", "created_at", "updated_at", "view_count",
            "createdAt", "updatedAt", "viewCount", "stock"
        }
        
        sort_field = str(ordering).lstrip("-")
        sort_direction = -1 if str(ordering).startswith("-") else 1

        # Map Django-style field names to MongoDB field names
        field_mapping = {
            "created_at": "createdAt",
            "updated_at": "updatedAt",
            "view_count": "viewCount",
        }
        sort_field = field_mapping.get(sort_field, sort_field)
        
        # Validate sort field against whitelist
        if sort_field not in allowed_sort_fields:
            sort_field = "createdAt"  # Default to safe field

        # Execute query with pagination
        cursor = products_collection.find(query).sort(sort_field, sort_direction).skip(skip).limit(limit)
        products = list(cursor)

        # Get total count for pagination
        total_count = products_collection.count_documents(query)

        # Serialize products
        serialized_products = [serialize_mongodb_doc(product) for product in products]

        logger.info(f"✅ Fetched {len(serialized_products)} products from MongoDB (total: {total_count})")

        return serialized_products, total_count

    except Exception as e:
        logger.error(f"❌ Error fetching products from MongoDB: {str(e)}")
        raise


def get_product_by_id_from_mongodb(product_id: str) -> Optional[Dict]:
    """
    Fetch a single product by ID from MongoDB Atlas.

    Args:
        product_id: Product ID (string or ObjectId)

    Returns:
        Product document or None if not found
    """
    try:
        mongo_conn = get_mongodb_connection()
        products_collection = mongo_conn.get_collection("products")

        # Sanitize product_id input
        safe_product_id = str(product_id)[:50].strip()
        if not safe_product_id:
            return None

        # Try to convert to ObjectId if it's a valid ObjectId string
        try:
            query = {"_id": ObjectId(safe_product_id)}
        except Exception:
            # If not a valid ObjectId, search by string id field (sanitized)
            query = {"id": safe_product_id}

        product = products_collection.find_one(query)

        if product:
            logger.info(f"✅ Fetched product {product_id} from MongoDB")
            return serialize_mongodb_doc(product)
        else:
            logger.warning(f"⚠️ Product {product_id} not found in MongoDB")
            return None

    except Exception as e:
        logger.error(f"❌ Error fetching product {product_id} from MongoDB: {str(e)}")
        raise


def get_categories_from_mongodb() -> List[Dict]:
    """
    Fetch all categories from MongoDB Atlas.

    Returns:
        List of category documents
    """
    try:
        mongo_conn = get_mongodb_connection()
        categories_collection = mongo_conn.get_collection("categories")

        cursor = categories_collection.find({})
        categories = list(cursor)

        # Serialize categories
        serialized_categories = [serialize_mongodb_doc(category) for category in categories]

        logger.info(f"✅ Fetched {len(serialized_categories)} categories from MongoDB")

        return serialized_categories

    except Exception as e:
        logger.error(f"❌ Error fetching categories from MongoDB: {str(e)}")
        # Return empty list if categories collection doesn't exist or has errors
        return []


def check_mongodb_connection() -> Dict[str, Any]:
    """
    Check MongoDB connection status and return health information.

    Returns:
        Dictionary with connection status and database info
    """
    try:
        mongo_conn = get_mongodb_connection()
        db = mongo_conn.get_database()

        # Get server info
        server_info = mongo_conn._client.server_info()

        # Count products
        products_count = db.products.count_documents({})

        return {
            "status": "connected",
            "database": db.name,
            "mongodb_version": server_info.get("version", "unknown"),
            "products_count": products_count,
        }
    except Exception as e:
        logger.error(f"❌ MongoDB health check failed: {str(e)}")
        return {"status": "disconnected", "error": str(e)}


def create_product_in_mongodb(product_data: Dict) -> str:
    """
    Create a new product in MongoDB.

    Args:
        product_data: Dictionary containing product information

    Returns:
        String ID of the created product
    """
    try:
        from datetime import datetime

        mongo_conn = get_mongodb_connection()
        products_collection = mongo_conn.get_collection("products")

        # Generate a new ID for the product
        product_data["id"] = str(ObjectId())
        product_data["createdAt"] = datetime.utcnow()
        product_data["updatedAt"] = datetime.utcnow()

        # Insert the product
        result = products_collection.insert_one(product_data)

        logger.info(f"✅ Created product with ID: {product_data['id']}")
        return product_data["id"]

    except Exception as e:
        logger.error(f"❌ Error creating product in MongoDB: {str(e)}")
        raise


def update_product_in_mongodb(product_id: str, product_data: Dict) -> bool:
    """
    Update an existing product in MongoDB.

    Args:
        product_id: Product ID (string or ObjectId)
        product_data: Dictionary containing updated product information

    Returns:
        Boolean indicating success
    """
    try:
        from datetime import datetime

        mongo_conn = get_mongodb_connection()
        products_collection = mongo_conn.get_collection("products")

        # Add updated timestamp
        product_data["updatedAt"] = datetime.utcnow()

        # Try to find by ObjectId first, then by string id field
        try:
            query = {"_id": ObjectId(product_id)}
        except:
            query = {"id": product_id}

        # Update the product
        result = products_collection.update_one(query, {"$set": product_data})

        if result.modified_count > 0 or result.matched_count > 0:
            logger.info(f"✅ Updated product {product_id}")
            return True
        else:
            logger.warning(f"⚠️ Product {product_id} not found for update")
            return False

    except Exception as e:
        logger.error(f"❌ Error updating product {product_id} in MongoDB: {str(e)}")
        raise


def delete_product_from_mongodb(product_id: str) -> bool:
    """
    Delete a product from MongoDB.

    Args:
        product_id: Product ID (string or ObjectId)

    Returns:
        Boolean indicating success
    """
    try:
        mongo_conn = get_mongodb_connection()
        products_collection = mongo_conn.get_collection("products")

        # Try to find by ObjectId first, then by string id field
        try:
            query = {"_id": ObjectId(product_id)}
        except:
            query = {"id": product_id}

        # Delete the product
        result = products_collection.delete_one(query)

        if result.deleted_count > 0:
            logger.info(f"✅ Deleted product {product_id}")
            return True
        else:
            logger.warning(f"⚠️ Product {product_id} not found for deletion")
            return False

    except Exception as e:
        logger.error(f"❌ Error deleting product {product_id} from MongoDB: {str(e)}")
        raise
