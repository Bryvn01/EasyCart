import os
import sqlite3

# Delete existing database
db_path = 'db.sqlite3'
if os.path.exists(db_path):
    os.remove(db_path)
    print("Database deleted")

# Create new database
conn = sqlite3.connect(db_path)
conn.close()
print("New database created")