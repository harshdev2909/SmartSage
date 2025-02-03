import os
import mimetypes
import openai
import spacy
from spacy.lang.en.stop_words import STOP_WORDS
from datetime import datetime
from flask import Flask, request, jsonify
from PyPDF2 import PdfReader
import docx2txt
from flask_cors import CORS
from langchain_openai import OpenAIEmbeddings
import json
from uitils.extraction import extract_text_from_file, extract_doctype_from_file, extract_embeddings_from_file, extract_keywords_from_file, extract_chapter_name_subject, extract_syllabus_or_date_changes
from uitils.portfolio import createProfile, updateProfile, addRoadmap
from uitils.chatbot import process_query, check_up_call, generate_quiz
from pymongo import MongoClient
from uitils.test import test_extract_text_from_file
from uitils.courses import generate_course
import dotenv
dotenv.load_dotenv()

# Initialize the Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3001"],  # Specify the frontend origin
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client['RGIT_DB']
FILES_COLLECTION = "files"
METADATA_COLLECTION = "metadata"
USER_COLLECTION = "users"
ROADMAP_COLLECTION="roadmap"
# Set up local storage directories
LOCAL_FILES_DIR = "./files"
LOCAL_METADATA_DIR = "./metadata"
os.makedirs(LOCAL_FILES_DIR, exist_ok=True)
os.makedirs(LOCAL_METADATA_DIR, exist_ok=True)

# Load environment variables (e.g., OpenAI API key)
openai.api_key = os.getenv("OPENAI_API_KEY")


@app.route('/upload', methods=['POST'])
def upload_document():
    """
    API endpoint to upload a file and extract text.
    """
    try:
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "File is required"}), 400

        # Detect content type of the file
        filename = file.filename
        if not filename:
            return jsonify({"error": "Filename is required"}), 400

        content_type, _ = mimetypes.guess_type(filename)

        # Extract text from the file
        extracted_text = extract_text_from_file(file, content_type)

        # Return the extracted text
        return jsonify({
            "message": "File uploaded and processed successfully",
            "document_content": {
                "extracted_text": extracted_text
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/test', methods=['POST'])
def solve_test():
    file = request.files.get("file")
    user_id = request.form.get("user_id", "default_user")  # Provide default string value
    prompt = request.form.get("prompt", "")  # Provide default empty string

    if not file:
        return jsonify({"error": "File is required"}), 400

    response = test_extract_text_from_file(file, prompt=prompt, user_id=user_id)
    return jsonify({"response": response})

@app.route('/portfolio/create', methods=['POST'])
def create_profile():
    """ Code to create profile """
    data = request.json
    return createProfile(data)


@app.route('/portfolio/update', methods=['POST'])
def update_profile():
    """ Code to update profile """
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    user_id = data.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    return updateProfile(user_id, data)



@app.route('/portfolio/roadmap', methods=['POST'])
def add_roadmap():
    try:
        data = request.get_json()
        print("Received request data:", data)

        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        user_id = data.get("user_id")
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        prompt = data.get("prompt")
        if not prompt:
            return jsonify({"error": "prompt is required"}), 400

        roadmap = addRoadmap(user_id, prompt, db=db, ROADMAP_COLLECTION=ROADMAP_COLLECTION)

        if not roadmap:
            return jsonify({"error": "Failed to generate roadmap"}), 500

        response_data = {
            "roadmap": roadmap,
            "message": "Roadmap generated successfully"
        }
        print("Sending response:", response_data)
        return jsonify(response_data), 200

    except Exception as e:
        print("Error in route:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/chatbot', methods=['POST'])
def chatbot():
    """
    API endpoint to process a query using the chatbot model.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    text = data.get("text")
    if not text:
        return jsonify({"error": "Text query is required"}), 400

    params = data.get("params", {})

    response = process_query(text, params)
    return jsonify({"response": response}), 200


@app.route('/call')
def call():
    # return jsonify({"response":"Turned off for credits"})
    tx=check_up_call("Swar")
    return jsonify({"response":tx})


@app.route('/user', methods=['GET'])
def get_profile():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    user_profile = db[USER_COLLECTION].find_one({"user_id": user_id})
    if not user_profile:
        return jsonify({"error": "User profile not found"}), 404

    #remove object id
    user_profile = {k: v for k, v in user_profile.items() if k != '_id'}
    return jsonify({"profile": user_profile}), 200

@app.route('/user/document', methods=['GET'])
def get_user_documents():
    user_id = request.args.get("user_id")
    documents = db[METADATA_COLLECTION].find({"user_id": user_id})

    #remove object id
    documents=[{k: v for k, v in doc.items() if k != '_id'} for doc in documents]

    return jsonify({"documents": list(documents)}), 200

@app.route('/evaluate-quiz', methods=['POST', 'OPTIONS'])
def evaluate_quiz():
    # Handle OPTIONS request
    if request.method == 'OPTIONS':
        return {}, 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        quiz_response = data.get('quiz_response')
        user_answers = data.get('user_answers')
        user_id = data.get('user_id')

        if not all([quiz_response, user_answers, user_id]):
            return jsonify({"error": "Missing required data"}), 400

        # Get questions from quiz response
        questions = quiz_response.get('response', {}).get('questions', [])

        # Initialize evaluation metrics
        total_questions = len(questions)
        correct_answers = 0
        total_marks = 0
        obtained_marks = 0
        details = []

        # Evaluate each question
        for question in questions:
            question_number = question['question_number']
            user_answer = user_answers.get(str(question_number))
            correct_answer = question['answer']
            marks = question['marks']

            is_correct = user_answer == correct_answer
            question_marks = marks if is_correct else 0

            if is_correct:
                correct_answers += 1
                obtained_marks += marks
            total_marks += marks

            details.append({
                "question_number": question_number,
                "question": question['question'],
                "user_answer": user_answer,
                "correct_answer": correct_answer,
                "is_correct": is_correct,
                "marks": marks,
                "obtained_marks": question_marks
            })

        # Calculate percentage
        percentage = (obtained_marks / total_marks * 100) if total_marks > 0 else 0

        result = {
            "user_id": user_id,
            "total_questions": total_questions,
            "correct_answers": correct_answers,
            "total_marks": total_marks,
            "obtained_marks": obtained_marks,
            "percentage": percentage,
            "details": details
        }

        return jsonify(result), 200

    except Exception as e:
        print(f"Error evaluating quiz: {str(e)}")
        return jsonify({
            "error": str(e),
            "message": "Failed to evaluate quiz"
        }), 500

@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    try:
        print("Received file upload request")
        content = None

        if 'file' not in request.files:
            print("No file in request")
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files['file']
        if not file or not file.filename:
            print("No filename")
            return jsonify({"error": "No file selected"}), 400

        print(f"Processing file: {file.filename}")

        # Create temp directory if it doesn't exist
        os.makedirs('temp', exist_ok=True)
        temp_path = os.path.join('temp', file.filename)

        try:
            file.save(temp_path)
            with open(temp_path, 'rb') as f:
                extracted_text = extract_text_from_file(f, 'application/pdf')

            if not extracted_text:
                raise ValueError("No text could be extracted from the file")

            print(f"Successfully extracted text, length: {len(extracted_text)}")

            # Truncate text if too long (OpenAI has token limits)
            max_text_length = 4000  # Adjust based on your needs
            truncated_text = extracted_text[:max_text_length]

            # Generate questions using OpenAI
            prompt = f"""
            Create 5 multiple choice questions based on the following text.
            For each question, provide:
            1. A clear, concise question
            2. Four possible options (A, B, C, D)
            3. The correct answer
            4. The subject area and chapter/topic

            Text: {truncated_text}

            Format each question as a JSON object with the following structure:
            {{
                "question_number": number,
                "question": "question text",
                "options": ["A", "B", "C", "D"],
                "answer": "correct option",
                "subject": "subject area",
                "chapter": "chapter/topic",
                "marks": 1
            }}

            Return an array of 5 such question objects.
            """

            print("Sending request to OpenAI")
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a quiz generator that creates multiple choice questions based on provided text."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )

            # Parse OpenAI response
            try:
                content = response.choices[0].message.content
                if content is None:
                    raise ValueError("Empty response from OpenAI")

                # Extract JSON from response (it might be wrapped in markdown code blocks)
                if isinstance(content, str):
                    if "```json" in content:
                        content = content.split("```json")[1].split("```")[0]
                    elif "```" in content:
                        content = content.split("```")[1]
                    content = content.strip()
                else:
                    raise ValueError("Invalid response type from OpenAI")

                questions = json.loads(content)
                print(f"Successfully generated {len(questions)} questions")

                # Validate question format
                for q in questions:
                    required_fields = ["question_number", "question", "options", "answer", "subject", "chapter", "marks"]
                    if not all(field in q for field in required_fields):
                        raise ValueError("Invalid question format in OpenAI response")
                    if len(q["options"]) != 4:
                        raise ValueError("Each question must have exactly 4 options")

                return jsonify({
                    "response": {
                        "questions": questions
                    }
                }), 200

            except json.JSONDecodeError as e:
                print(f"Error parsing OpenAI response: {str(e)}")
                print(f"Raw response: {content if content else 'No content'}")
                raise ValueError("Failed to parse OpenAI response")

        except Exception as e:
            print(f"Error processing file or generating questions: {str(e)}")
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise

        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({
            "error": f"Internal server error: {str(e)}",
            "message": "Failed to process the file or generate questions"
        }), 500

@app.route('/load-roadmaps', methods=['POST'])
def load_roadmaps():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    # Fetch the roadmaps from MongoDB for the provided user_id
    roadmaps = list(db[ROADMAP_COLLECTION].find({"user_id": user_id}))
    if not roadmaps:
        return jsonify({"roadmaps": []}), 200

    # Remove object IDs from the response
    roadmaps = [{"title": roadmap.get("title"), "roadmap": roadmap.get("roadmap")} for roadmap in roadmaps]

    return jsonify({"roadmaps": roadmaps}), 200


@app.route('/quiz', methods=['POST'])
def quiz():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    prompt = data.get("prompt", [])
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    num_questions = data.get("num_questions", 5)
    quiz = generate_quiz(prompt, user_id=user_id, num_questions=num_questions)

    return jsonify({"response": quiz}), 200

@app.route('/course', methods=['POST'])
def generate_course_endpoint():
    """
    Generate course content based on uploaded file
    """
    try:
        # Get file from request
        file = request.files.get('file')
        if not file:
            return jsonify({"error": "No file provided"}), 400

        # Detect content type
        filename = file.filename
        if not filename:
            return jsonify({"error": "No filename provided"}), 400

        mimetype, _ = mimetypes.guess_type(str(filename))
        if not mimetype:
            return jsonify({"error": "Could not determine file type"}), 400

        # Extract text from file
        text = extract_text_from_file(file, mimetype)
        if not text:
            return jsonify({"error": "Could not extract text from file"}), 400

        # Split text into smaller chunks to avoid token limits
        words = text.split()
        chunk_size = 1500  # Adjust based on your needs
        chunks = [' '.join(words[i:i + chunk_size])
                 for i in range(0, len(words), chunk_size)]

        all_slides = []
        for i, chunk in enumerate(chunks):
            print(f"Processing chunk {i+1} of {len(chunks)}")

            # Generate slides for this chunk
            prompt = f"""
            Create educational slides from this text:
            {chunk}

            Format each slide as:
            {{
                "title": "Clear and concise title",
                "content": "Detailed slide content"
            }}

            Return an array of slides.
            """

            try:
                response = openai.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a course content generator."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7
                )

                content = response.choices[0].message.content
                if not content:
                    print(f"Empty content from OpenAI for chunk {i+1}")
                    continue

                # Clean and parse the response
                clean_content = content
                if "```json" in content:
                    json_parts = content.split("```json")
                    if len(json_parts) > 1:
                        clean_content = json_parts[1].split("```")[0]
                elif "```" in content:
                    json_parts = content.split("```")
                    if len(json_parts) > 1:
                        clean_content = json_parts[1]

                try:
                    chunk_slides = json.loads(clean_content.strip())
                    if isinstance(chunk_slides, dict) and "slides" in chunk_slides:
                        all_slides.extend(chunk_slides["slides"])
                    elif isinstance(chunk_slides, list):
                        all_slides.extend(chunk_slides)
                except json.JSONDecodeError as e:
                    print(f"Error parsing chunk {i+1}: {str(e)}")
                    continue

            except Exception as e:
                print(f"Error processing chunk {i+1}: {str(e)}")
                continue

        if not all_slides:
            return jsonify({
                "slides": [{
                    "title": "Error",
                    "content": "Could not generate slides from the content"
                }]
            })

        return jsonify({"slides": all_slides})

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/flashcards', methods=['POST'])
def generate_flashcards():
    try:
        file = request.files.get("file", None)
        text = request.form.get("text", None)
        user_id = request.form.get("user_id", None)

        if file:
            filename = file.filename
            if filename is None:
                return jsonify({"error": "Invalid filename"}), 400
            content_type, _ = mimetypes.guess_type(str(filename))
            extracted_text = extract_text_from_file(file, content_type)
            if extracted_text is None:
                return jsonify({"error": "Could not extract text from file"}), 400
        elif text:
            extracted_text = text
        else:
            return jsonify({"error": "Either a file or text content must be provided"}), 400

        # Generate structured flashcards using OpenAI
        prompt = f"""
        Create exactly 5 flashcards from this content. Return ONLY a JSON array of flashcards.
        Content: {extracted_text[:3000] if extracted_text else ''}

        Format each flashcard as:
        {{
            "question": "Clear concise question",
            "answer": "Clear concise answer",
            "topic": "Topic of this flashcard"
        }}

        Return ONLY the JSON array, nothing else. Example:
        [
            {{
                "question": "What is...",
                "answer": "It is...",
                "topic": "Main concept"
            }},
            // more cards...
        ]
        """

        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a flashcard generator. Always respond with valid JSON arrays containing flashcards."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        # Extract and parse the response
        response_content = response.choices[0].message.content
        if response_content is None:
            raise ValueError("Empty response from OpenAI")

        response_text = response_content.strip()

        # Clean the response to ensure it's valid JSON
        if response_text.startswith('```json'):
            response_text = response_text.replace('```json', '').replace('```', '').strip()

        # Parse the JSON and validate the structure
        try:
            flashcards = json.loads(response_text)
            if not isinstance(flashcards, list):
                raise ValueError("Response is not a list")

            # Validate each flashcard
            for card in flashcards:
                if not all(key in card for key in ['question', 'answer', 'topic']):
                    raise ValueError("Invalid flashcard structure")

            print(f"Successfully generated {len(flashcards)} flashcards")
            return jsonify({"flashcards": flashcards}), 200

        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {str(e)}")
            # Fallback: Create basic flashcards from the text
            fallback_flashcards = [
                {
                    "question": "What is the main topic of this document?",
                    "answer": extracted_text[:100] if extracted_text else "No text available",
                    "topic": "Overview"
                }
            ]
            return jsonify({"flashcards": fallback_flashcards}), 200

    except Exception as e:
        print(f"Error in generate_flashcards: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
