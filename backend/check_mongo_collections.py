"""
Script to list all collections and document counts in your MongoDB database.
Usage: python check_mongo_collections.py
"""

from pymongo import MongoClient

MONGO_URI = "mongodb+srv://<username>:<password>@cluster0.p7rcwl5.mongodb.net/easycart"
DB_NAME = "easycart"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print(f"Collections and document counts in database '{DB_NAME}':\n")
for name in db.list_collection_names():
    count = db[name].count_documents({})
    print(f"- {name}: {count} documents")

client.close()
