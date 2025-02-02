import datetime
import os

from pymongo import MongoClient
import dotenv

dotenv.load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client['RGIT_DB']

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
        user_answer = user_answers.get(question_number)
        marks = question.get("marks", 0)
        is_correct = user_answer == correct_answer

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


## Example input and output
#QUIZ
# {
#   "response": {
#     "questions": [
#       {
#         "question_number": 1,
#         "answer": "Ease of access",
#         "chapter": "Arrays",
#         "difficulty": "Medium",
#         "hint": "Arrays allow direct access to elements using indices.",
#         "marks": 1,
#         "options": [
#           "Dynamic size",
#           "Ease of access",
#           "Memory efficiency",
#           "Complex operations"
#         ],
#         "question": "What is the main advantage of using arrays in data structures?",
#         "subject": "Data Structures"
#       },
#       {
#         "question_number": 2,
#         "answer": "To improve performance through experience",
#         "chapter": "Machine Learning",
#         "difficulty": "Hard",
#         "hint": "Machine Learning algorithms learn from data to make predictions.",
#         "marks": 2,
#         "options": [
#           "To create intelligent machines",
#           "To improve performance through experience",
#           "To simulate human thought",
#           "To solve complex problems"
#         ],
#         "question": "In the context of Artificial Intelligence, what is the primary goal of Machine Learning?",
#         "subject": "Artificial Intelligence"
#       },
#       {
#         "question_number": 3,
#         "answer": "Linked List",
#         "chapter": "Linked Lists",
#         "difficulty": "Hard",
#         "hint": "A linked list allows efficient insertion and deletion at both ends.",
#         "marks": 1,
#         "options": [
#           "Array",
#           "Linked List",
#           "Stack",
#           "Hash Table"
#         ],
#         "question": "Which data structure is best suited for implementing a queue?",
#         "subject": "Data Structures"
#       }
#     ]
#   }
# }
#user_answers
# {
#   "1": "Ease of access",
#   "2": "To create intelligent machines",
#   "3": "Linked List"
# }

#
