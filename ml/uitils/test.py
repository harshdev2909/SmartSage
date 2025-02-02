from .extraction import extract_text_from_file
from .chatbot import process_query, retrieval, generate_openai
import requests
def test_extract_text_from_file(file, prompt="Solve it well please", user_id="user_1"):
    # Test for PDF file
    text = extract_text_from_file(file, content_type="pdf")
    retrieved = retrieval(f"The user gave prompt{prompt} and asks you to solve {text}", params={"user_id": user_id})
    subject = retrieved.get("subject", [])
    chapter = retrieved.get("chapter", [])

    # Add subject and chapter to params
    params = {
        "user_id": user_id,
        "subject": subject,
        "chapter": chapter
    }

    profile = requests.get("http://localhost:5000/user", params={"user_id": user_id})

    text = generate_openai(f"""
                         Solve the given assignment to the user in a file with the prompt given by the user.
                            The user has the following profile: {profile}
                            User prompt is {prompt}
                            The extracted text is from the assigment **IMPORTANT** {text}.
                            Return the test response in a json format. with keys: 'text' and 'code' as applicable.

                         """)

    return text



# take input file prompt user_id
# pull - (process query ) the subj required or the suitable doc(retrival )
# put the thile and prompt to the chatbot (generate vala func add)
# return the subj and chapt as params
