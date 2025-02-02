import datetime
import os

import PyPDF2
from pymongo import MongoClient
import dotenv

dotenv.load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client['RGIT_DB']

def extract_text_from_pdf(pdf_path):
    """
    Extracts text from the provided PDF file.

    Parameters:
    - pdf_path: Path to the PDF file.

    Returns:
    - Extracted text as a string.
    """
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        return str(e)

def generate_quiz_from_pdf(pdf_text, num_questions=5):
    """
    Generates a quiz based on the extracted text from a PDF.

    Parameters:
    - pdf_text: Text extracted from the PDF.
    - num_questions: Number of questions to generate.

    Returns:
    - A dictionary containing quiz questions.
    """
    sentences = pdf_text.split(". ")  # Split text into sentences
    questions = []

    for i in range(min(num_questions, len(sentences))):
        question_text = sentences[i].strip()
        questions.append({
            "question_number": i + 1,
            "question": question_text,
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],  # Dummy options
            "answer": "Option 1",  # Dummy correct answer
            "chapter": "Default Chapter",  # Placeholder chapter
            "subject": "Default Subject",  # Placeholder subject
            "marks": 1,
            "difficulty": "Medium",
        })

    return {"questions": questions}

def evaluate_and_analyze_quiz(quiz_response, user_answers, user_id):
    """
    Evaluate and analyze quiz performance, then save results to MongoDB.

    Parameters:
    - quiz_response: JSON containing quiz questions and details.
    - user_answers: A dictionary where keys are question indices, and values are user's answers.
    - user_id: Unique identifier for the user attempting the quiz.

    Returns:
    - A dictionary summarizing and analyzing the user's performance.
    """
    questions = quiz_response.get('response', {}).get('questions', [])
    if not questions:
        return {"error": "Invalid quiz response data"}

    # Initialize metrics
    total_questions = len(questions)
    correct_answers = 0
    total_marks = 0
    obtained_marks = 0
    details = []
    subject_analysis = {}
    chapter_analysis = {}

    # Evaluate and analyze each question
    for index, question in enumerate(questions):
        question_number = question.get("question_number")
        subject = question.get("subject")
        chapter = question.get("chapter")
        correct_answer = question.get("answer")

        # Access user_answer using question_number (keys are strings now)
        user_answer = user_answers.get(str(question_number))

        marks = question.get("marks", 0)

        # Normalize answers for comparison (trim and lowercase)
        normalized_correct_answer = correct_answer.strip().lower()
        normalized_user_answer = user_answer.strip().lower() if user_answer else ""

        is_correct = normalized_user_answer == normalized_correct_answer

        # Update performance metrics
        if is_correct:
            correct_answers += 1
            obtained_marks += marks
        total_marks += marks

        # Add question details
        details.append({
            "question_number": question_number,
            "question": question.get("question"),
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "is_correct": is_correct,
            "subject": subject,
            "chapter": chapter,
            "marks": marks,
            "obtained_marks": marks if is_correct else 0
        })

        # Update subject-level analysis
        if subject not in subject_analysis:
            subject_analysis[subject] = {"total_questions": 0, "correct_answers": 0, "total_marks": 0, "obtained_marks": 0}
        subject_analysis[subject]["total_questions"] += 1
        subject_analysis[subject]["total_marks"] += marks
        if is_correct:
            subject_analysis[subject]["correct_answers"] += 1
            subject_analysis[subject]["obtained_marks"] += marks

        # Update chapter-level analysis
        if chapter not in chapter_analysis:
            chapter_analysis[chapter] = {"total_questions": 0, "correct_answers": 0, "total_marks": 0, "obtained_marks": 0}
        chapter_analysis[chapter]["total_questions"] += 1
        chapter_analysis[chapter]["total_marks"] += marks
        if is_correct:
            chapter_analysis[chapter]["correct_answers"] += 1
            chapter_analysis[chapter]["obtained_marks"] += marks

    # Calculate percentages
    overall_percentage = (obtained_marks / total_marks) * 100 if total_marks > 0 else 0
    for subject, data in subject_analysis.items():
        data["percentage"] = (data["obtained_marks"] / data["total_marks"]) * 100 if data["total_marks"] > 0 else 0
    for chapter, data in chapter_analysis.items():
        data["percentage"] = (data["obtained_marks"] / data["total_marks"]) * 100 if data["total_marks"] > 0 else 0

    # Generate recommendations
    recommendations = []
    for chapter, data in chapter_analysis.items():
        if data["percentage"] < 50:
            recommendations.append(f"Focus more on the chapter '{chapter}', as your accuracy is below 50%.")
    for subject, data in subject_analysis.items():
        if data["percentage"] < 60:
            recommendations.append(f"Spend more time studying '{subject}' to improve overall understanding.")

    if overall_percentage < 50:
        recommendations.append("Your overall performance is below average. Review your weaker areas and practice more.")
    elif overall_percentage < 75:
        recommendations.append("Good effort! However, there is room for improvement in some subjects and chapters.")

    # Create performance summary
    performance_summary = {
        "user_id": user_id,
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "total_marks": total_marks,
        "obtained_marks": obtained_marks,
        "overall_percentage": overall_percentage,
        "subject_analysis": subject_analysis,
        "chapter_analysis": chapter_analysis,
        "recommendations": recommendations,
        "details": details,
        "timestamp": datetime.datetime.now()
    }

    # Save to MongoDB
    db['quiz_attempts'].insert_one(performance_summary)

    # Return performance summary
    return performance_summary
