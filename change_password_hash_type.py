# This script should help to change user password hash method 
# that has changed with werkzeuk 3.0.0 version.
# Before running this script install an older werkzeug version (werkzeug==2.0.3 should be ok)
# for each users change user and password lower in source code.
# don't forget to start mongodb server
# then run this script for all users
# once all users are converted, install werkzeug 3+ ((werkzeug==3.0.0 for exemple)

from pymongo import MongoClient
from werkzeug.security import check_password_hash, generate_password_hash

user="admin"
password="admin"

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017")
# Assuming the database name is "flask" and the collection name is "user_model"
db = client["flask"]
collection = db["user_model"]

# Verify user password and return a different hash method
def verify_password_and_generate_hash(password, hashed_password):
    if check_password_hash(hashed_password, password):
        new_hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=8)
        return new_hashed_password
    else:
        return None

# Get document ID from collection using username
def get_old_hash(username):
    # Find the document with the specified username
    document = collection.find_one({"username": username})
    if document:
        return document["password"]
    else:
        return None

# Get document ID from collection using username
def get_document_id(username):
    # Find the document with the specified username
    document = collection.find_one({"username": username})
    if document:
        return document["_id"]
    else:
        return None

# Read the collection
def read_collection():
    documents = collection.find()
    for document in documents:
        print(document)

# Change a value in the collection
def change_value(document_id, new_password):
    # Update the document with the specified _id
    collection.update_one({"_id": document_id, "username": "admin"}, {"$set": {"password": new_password}})
    print("Password changed successfully.")


# Usage example
if __name__ == "__main__":
    # Read the collection
    read_collection()
    
    old_hash = get_old_hash(user)
    print('old_hash:', old_hash)
    new_hash = verify_password_and_generate_hash(password, old_hash)
    print('new_hash:', new_hash)
    user_id = get_document_id(user)
    print('user_id:', user_id)

    change_value(user_id, new_hash);



