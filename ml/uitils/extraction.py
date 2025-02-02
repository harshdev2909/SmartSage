import os

import openai
import spacy
from spacy.lang.en.stop_words import STOP_WORDS


from PyPDF2 import PdfReader

from langchain_openai import OpenAIEmbeddings
import json
import requests
import base64
import dotenv
from pymongo import MongoClient

from io import BufferedReader

dotenv.load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(mongo_uri)
db = client['RGIT_DB']
users_collection = db['users']
docs_collection = db['metadata']


nlp = spacy.load("en_core_web_sm")

# Set up local storage directories
LOCAL_FILES_DIR = "./files"
LOCAL_METADATA_DIR = "./metadata"
os.makedirs(LOCAL_FILES_DIR, exist_ok=True)
os.makedirs(LOCAL_METADATA_DIR, exist_ok=True)

# Load environment variables (e.g., OpenAI API key)
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_openai(prompt,max_tokens=2000,temperature=0.3,model='gpt-4o-mini',json_parse=False):
    response = openai.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": prompt}
        ],
        max_tokens=max_tokens,
        temperature=temperature,
    )
    if json_parse:
        if response.choices[0].message.content is None:
            return {}
        result = response.choices[0].message.content.replace("```json","").replace("```","")
        result = json.loads(result)
    else:
        if response.choices[0].message.content is None:
            return ""
        result = response.choices[0].message.content
    return result

def encode_image(image_file: BufferedReader) -> str:
    """
    Encode the image to base64 format for API consumption.
    """
    return base64.b64encode(image_file.read()).decode('utf-8')
def get_description_from_image(file: BufferedReader) -> str:
    """
    Send image to OpenAI to generate a detailed description of the image.
    """
    # Encode the image to base64
    base64_image = encode_image(file)

    # Prepare headers for the API request
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai.api_key}"
    }

    # Prepare the payload with image encoded in base64
    payload = {
        "model": "gpt-4o-mini",  # Replace with the model you're using (this is a placeholder)
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "If the image is OCR text, for eg, it's a picture of notes or something. Then only return the text. Otherwise, return a description of the image."
                    },

                ],
                "data": {
                    "image": base64_image
                }
            }
        ],
        "max_tokens": 1000
    }

    # Send a POST request to OpenAI API
    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

    # Check the response status and handle any errors
    if response.status_code == 200:
        result = response.json()
        # Extract and return the description
        return result.get("choices", [{}])[0].get("message", {}).get("content", "No description found")
    else:
        # If the request fails, print the error message
        print(f"Error: {response.status_code} - {response.text}")
        return "Error fetching description"

def extract_text_from_file(file, content_type):
    try:
        if content_type == 'application/pdf':
            reader = PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        else:
            return "Unsupported file type"
    except Exception as e:
        print(f"Error extracting text: {str(e)}")
        return None

def extract_doctype_from_file(extracted_text):
    """
    Use AI to infer the document type (e.g., study material, announcement, test).
    """
    prompt = f"Classify the following text into document type such as study material, announcement, test or Experiment:\n\n{extracted_text[:1000]}. Return either STUDY_MATERIAL, ANNOUNCEMENT or EXPERIMENT in a single word as this will be used for parsing. Study materials are documentations such as notes from where student can learn. Announcement is a type of document which are changes in the institutions information. for eg change in syllabus, new upcoming tests etc. So if an institution document is given which shows the syllabus of a subject or changes in timetable or schedule, it should be considered as an ANNOUNCEMENT"
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt}
        ],
        max_tokens=500,
        temperature=0.3,
    )
    classification = response.choices[0].message.content
    return classification

def extract_embeddings_from_file(extracted_text):
    """
    Generate text embeddings using OpenAI's embeddings model.
    """
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-large",
    )
    # embeddings.embed_query(extracted_text)
    return embeddings.embed_query(extracted_text)

def extract_keywords_from_file(extracted_text):
    """
    Extract key topics/keywords using AI.
    """
    doc = nlp(extracted_text)
    keywords = [ent.text for ent in doc.ents if ent.text.lower() not in STOP_WORDS]
    return list(set(keywords))  # Remove duplicates

def extract_chapter_name_subject(extracted_text,user_id):
    """
    If document type is 'study material', extract the chapter name and subject.
    """
    user_profile = users_collection.find_one({"user_id": user_id})
    if not user_profile:
        return {"subject": "", "chapter": ""}

    syllabus = json.dumps(user_profile['syllabus'])
    prompt = f"Extract the subject and chapter name from this study material text:\n\n{extracted_text[:1000]}. Return it in a json format with keys subject and chapter. The syllabus for the user is {syllabus}"
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt}
        ],
        max_tokens=1000,
        temperature=0.3,
    )

    result = response.choices[0].message.content
    if result is None:
        return {"subject": "", "chapter": ""}

    print(result)
    result=result.replace("```json","").replace("```","")
    try:
        res=json.loads(result)
        return res
    except:
        return {"subject": "", "chapter": ""}

    # Assuming response in JSON format with subject and chapter

def extract_syllabus_or_date_changes(extracted_text,user_id):
    """
    If document type is 'announcement', extract syllabus changes or date changes.
    """
    user_profile = users_collection.find_one({"user_id": user_id})
    if not user_profile:
        return {}

    prompt = f"Extract any syllabus changes or date changes from this announcement text in json format:\n\n{extracted_text[:1000]}. The user profile for the user is {user_profile} "
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt}
        ],
        max_tokens=5000,
        temperature=0.3,
    )
    if response.choices[0].message.content is None:
        return {}
    result = response.choices[0].message.content.replace("```json","").replace("```","")
    print(result)
    try:
        return json.loads(result)
    except:
        return {}
