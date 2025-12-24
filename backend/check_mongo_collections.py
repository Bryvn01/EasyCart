"""
Script to list all collections and document counts in your MongoDB database.
Usage: python check_mongo_collections.py
"""

import os
from pymongo import MongoClient

MONGO_URI = os.environ.get("MONGODB_URI") or os.environ.get("MONGO_URI")
DB_NAME = os.environ.get("MONGODB_DB") or os.environ.get("MONGO_DB") or "easycart"

if not MONGO_URI:
    raise RuntimeError(
        "Missing MongoDB connection string. Set MONGODB_URI (or MONGO_URI) in your environment."
    )

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print(f"Collections and document counts in database '{DB_NAME}':\n")
for name in db.list_collection_names():
    count = db[name].count_documents({})
    print(f"- {name}: {count} documents")

client.close()
