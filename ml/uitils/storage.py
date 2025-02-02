import os
import json
from pymongo import MongoClient
# Import from bson.objectid as recommended
from bson.objectid import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")  # Make sure to set your MongoDB URI in .env
client = MongoClient(MONGO_URI)
db = client['RGIT_DB']  # Use 'portfolio_db' as the database
profiles_collection = db['users']  # Use 'profiles' as the collection for storing user profiles

def save_portfolio(profiles):
    """
    Save profiles to MongoDB collection. Either create a new profile or update an existing one.

    Args:
        profiles (dict): Dictionary containing all user profiles to save.
    """
    for user_id, profile_data in profiles.items():
        # Update the profile or insert if it doesn't exist (using upsert=True)
        profiles_collection.update_one(
            {"user_id": user_id},
            {"$set": profile_data},
            upsert=True
        )
    print("Profiles saved to MongoDB")

def load_portfolio():
    """
    Load all profiles from MongoDB into an in-memory dictionary.

    Returns:
        dict: Dictionary containing all profiles loaded from MongoDB.
    """
    profiles = {}
    # Fetch all profiles from MongoDB
    for profile in profiles_collection.find():
        user_id = profile.get("user_id")
        profiles[user_id] = profile
    print("Profiles loaded from MongoDB")
    return profiles

def save_portfolio_to_csv(profiles, csv_file="portfolio.csv"):
    """
    Save the profiles to a CSV file for export purposes.

    Args:
        profiles (dict): Dictionary of profiles to save.
        csv_file (str): Path to the CSV file.
    """
    import csv
    if profiles:
        fieldnames = ["user_id", "name", "email", "age", "degree", "calendar", "syllabus"]
        with open(csv_file, mode="w", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()

            for profile in profiles.values():
                writer.writerow({
                    "user_id": profile.get("user_id"),
                    "name": profile.get("name"),
                    "email": profile.get("email"),
                    "age": profile.get("age"),
                    "degree": profile.get("degree"),
                    "calendar": json.dumps(profile.get("calendar", [])),
                    "syllabus": json.dumps(profile.get("syllabus", [])),
                })
        print(f"Profiles saved to {csv_file}")

def get_profile_from_mongo(user_id):
    """
    Retrieve a specific user profile from MongoDB by user_id.

    Args:
        user_id (str): The unique user identifier.

    Returns:
        dict: User profile if found, otherwise None.
    """
    profile = profiles_collection.find_one({"user_id": user_id})
    if profile:
        return profile
    else:
        return None

def delete_profile(user_id):
    """
    Delete a user profile from MongoDB by user_id.

    Args:
        user_id (str): The unique user identifier.

    Returns:
        bool: True if deletion was successful, False if no profile was found.
    """
    result = profiles_collection.delete_one({"user_id": user_id})
    return result.deleted_count > 0
