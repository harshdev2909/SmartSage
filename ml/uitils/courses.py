import os
import json
import mimetypes
from .extraction import extract_text_from_file
from .chatbot import generate_openai

# Function to split text into chunks
def split_text_into_chunks(text, chunk_size=1000):
    """
    Splits the given text into chunks of approximately `chunk_size` words.

    Args:
        text (str): The text to split.
        chunk_size (int): The number of words per chunk.

    Returns:
        list: A list of text chunks.
    """
    words = text.split()
    return [' '.join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]

def generate_course(file, output_path=None, chunk_size=2000):
    """
    Generate course content based on the input file.
    """
    try:
        # Detect file type (mimetype)
        mimetype, _ = mimetypes.guess_type(file.filename)
        if not mimetype:
            raise ValueError("Could not determine file mimetype.")

        # Extract text from the file
        text = extract_text_from_file(file, mimetype)
        if not text:  # Check if text is None
            raise ValueError("No text extracted from file.")
        if not text.strip():  # Only strip if text is not None
            raise ValueError("Empty text content found in the file.")

        # Split text into chunks
        chunks = split_text_into_chunks(text, chunk_size=chunk_size)

        # Define the system prompt
        system_prompt = """
        You are a course content generator. Create educational slides from the given text.
        Each slide should have a title and content.
        Format your response as a JSON array of slides.
        Example format:
        {
            "slides": [
                {
                    "title": "Introduction",
                    "content": "Main content of the slide"
                },
                {
                    "title": "Key Concepts",
                    "content": "Content explaining key concepts"
                }
            ]
        }
        """

        # Generate slides for each chunk
        all_slides = []
        for idx, chunk in enumerate(chunks):
            print(f"Processing chunk {idx + 1} of {len(chunks)}...")
            try:
                prompt = f"{system_prompt}\n\nText to convert into slides:\n{chunk}"

                # Generate response using OpenAI
                response = generate_openai(prompt)

                # Try to parse the response as JSON
                try:
                    # First, try direct JSON parsing
                    if isinstance(response, str):
                        # Remove any markdown code block indicators if present
                        response = response.replace("```json", "").replace("```", "").strip()
                        parsed_response = json.loads(response)
                    else:
                        parsed_response = response

                    # Validate the response structure
                    if isinstance(parsed_response, dict) and 'slides' in parsed_response:
                        all_slides.extend(parsed_response['slides'])
                    else:
                        print(f"Invalid response structure for chunk {idx + 1}")
                        continue

                except json.JSONDecodeError as json_err:
                    print(f"JSON parsing error in chunk {idx + 1}: {str(json_err)}")
                    print("Raw response:", response)
                    continue

            except Exception as e:
                print(f"Error processing chunk {idx + 1}: {str(e)}")
                continue

        # If no slides were generated, return an error
        if not all_slides:
            return {"slides": [{"title": "Error", "content": "Could not generate slides from the provided content."}]}

        # Create final output
        final_output = {"slides": all_slides}

        # Optionally save to file
        if output_path:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(final_output, f, indent=4, ensure_ascii=False)

        return final_output

    except Exception as e:
        print(f"Error in generate_course: {str(e)}")
        return {"slides": [{"title": "Error", "content": f"An error occurred: {str(e)}"}]}
