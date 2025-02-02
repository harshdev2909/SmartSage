from .storage import save_portfolio, load_portfolio


from datetime import datetime  # Import datetime library
from pymongo import MongoClient  # Import MongoClient for MongoDB integration

import os
import openai
# Load the portfolio database from MongoDB (using the load_portfolio from storage.py)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
if not MONGO_URI:
    raise ValueError("MongoDB URI is not defined in the .env file")
# Initialize MongoDB client
client = MongoClient(MONGO_URI)
db = client["RGIT_DB"]  # Replace with your database name
roadmap_collection = db["roadmap"]  # Roadmap collection name


portfolio_db = load_portfolio()

def createProfile(data):
    """
    Function to create a new profile.

    Args:
        data (dict): Dictionary containing user profile information.

    Returns:
        dict: Result message (success or error).
    """
    user_id = data.get("user_id")

    if not user_id:
        return {"status": "error", "message": "User ID is required"}

    # Check if the profile already exists
    if user_id in portfolio_db:
        return {"status": "error", "message": "User profile already exists"}

    # Save the profile to MongoDB
    portfolio_db[user_id] = data  # Store it in the in-memory database
    save_portfolio(portfolio_db)  # Save to MongoDB

    # Debugging output to confirm storage in memory
    print("Current Portfolio DB (after creation):", portfolio_db)

    return {"status": "success", "message": "Profile created successfully", "data": data}

def updateProfile(user_id, updated_data):

    if not user_id:
         return {"status": "error", "message": "User ID is required"}

    # Check if the profile exists
    if user_id not in portfolio_db:
        return {"status": "error", "message": "User profile not found"}

    # Update the profile with new data in-memory
    portfolio_db[user_id].update(updated_data)

    # Manage calendar updates
    if 'calendar' in updated_data:
        # Append new calendar events
        existing_calendar = portfolio_db[user_id].get('calendar', [])
        new_calendar_events = updated_data['calendar']
        existing_calendar.extend(new_calendar_events)
        portfolio_db[user_id]['calendar'] = existing_calendar

    # Save the updated profile to MongoDB
    save_portfolio(portfolio_db)  # Save updated data to MongoDB

    # Debugging output to confirm storage after update
    print("Current Portfolio DB (after update):", portfolio_db)

    return {"status": "success", "message": "Profile updated successfully"}

def getProfile(user_id):
    """
    Function to get an existing profile by user_id.

    Args:
        user_id (str): Unique identifier of the user.

    Returns:
        dict: User profile if found, or an error message.
    """
    if not user_id:
        return {"status": "error", "message": "User ID is required"}

    # Retrieve the profile from the in-memory database
    profile = portfolio_db.get(user_id)

    if not profile:
        return {"status": "error", "message": "User profile not found"}

    return {"status": "success", "data": profile}


import traceback

def addRoadmap(user_id, prompt, db, ROADMAP_COLLECTION):
    try:
        # Generate roadmap using OpenAI
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "Generate a learning roadmap with 5-10 steps. Format each step as 'Title: [title] | Description: [description]'"
                },
                {"role": "user", "content": prompt}
            ]
        )

        if not response or not response.choices or not response.choices[0].message:
            print("Invalid response from OpenAI")
            return []

        roadmap_text = response.choices[0].message.content
        if not roadmap_text:
            print("Empty roadmap text received")
            return []

        print("OpenAI response:", roadmap_text)

        # New parsing logic
        steps = []
        current_title = None
        current_description = None

        # Split the response into lines
        lines = roadmap_text.split('\n')

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Look for title indicators
            if 'Title:' in line:
                # If we have a previous step complete, add it
                if current_title and current_description:
                    steps.append({
                        "title": current_title.strip(),
                        "description": current_description.strip(),
                        "duration": "2-3 weeks"
                    })

                # Extract new title
                title_parts = line.split('Title:')
                if len(title_parts) > 1:
                    current_title = title_parts[1].split('|')[0].strip()
                    current_description = ""

            # Look for description indicators
            elif 'Description:' in line:
                desc_parts = line.split('Description:')
                if len(desc_parts) > 1:
                    current_description = desc_parts[1].strip()

            # If line starts with a number, treat it as a new step
            elif line[0].isdigit() and '.' in line:
                # If we have a previous step complete, add it
                if current_title and current_description:
                    steps.append({
                        "title": current_title.strip(),
                        "description": current_description.strip(),
                        "duration": "2-3 weeks"
                    })

                # Split the numbered line into title and description
                parts = line.split('.', 1)
                if len(parts) > 1:
                    parts = parts[1].split('-', 1)
                    current_title = parts[0].strip()
                    current_description = parts[1].strip() if len(parts) > 1 else ""

        # Add the last step if exists
        if current_title and current_description:
            steps.append({
                "title": current_title.strip(),
                "description": current_description.strip(),
                "duration": "2-3 weeks"
            })

        # Fallback parsing if the above didn't work
        if not steps:
            import re
            if roadmap_text:  # Only process if roadmap_text is not None
                sections = re.split(r'^\d+\.', roadmap_text, flags=re.MULTILINE)
                if sections and len(sections) > 1:  # Skip first empty split
                    for section in sections[1:]:
                        if section:  # Only process non-empty sections
                            parts = section.strip().split('\n', 1)
                            if len(parts) >= 1:
                                title = parts[0].strip()
                                description = parts[1].strip() if len(parts) > 1 else ""
                                # Remove any bullet points or "Description:" text
                                description = description.replace('- Description:', '').replace('-', '').strip()
                                steps.append({
                                    "title": title,
                                    "description": description,
                                    "duration": "2-3 weeks"
                                })

        print("Structured roadmap:", steps)

        # Store in database
        if steps:
            db[ROADMAP_COLLECTION].insert_one({
                "user_id": user_id,
                "roadmap": steps,
                "created_at": datetime.utcnow()
            })

        return steps

    except Exception as e:
        print("Error in addRoadmap:", str(e))
        print("Traceback:", traceback.format_exc())
        return []  # Return empty list instead of raising exception
