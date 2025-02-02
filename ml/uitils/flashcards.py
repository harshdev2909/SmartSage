import os
from pathlib import Path
import PyPDF2
import google.generativeai as genai
import json
import time
import dotenv

class SimpleFlashcardGenerator:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            print(f"Error reading PDF {pdf_path}: {e}")
            return ""

    def generate_flashcards(self, content: str, source: str) -> list:
            prompt = f"""
            Create educational flashcards from this content.
            Content: {content[:3000]}

            Create 10 flashcards with clear questions and concise answers.

            Example format:
            [
                {{
                    "question": "What is X?",
                    "answer": "X is...",
                    "topic": "Main topic",
                    "source": "{source}"
                }}
            ]

            Generate similar flashcards for the main concepts in the content.
            """

            response = None
            try:
                response = self.model.generate_content(prompt)
                # Clean the response text
                clean_text = response.text.strip()
                if clean_text.startswith('```json'):
                    clean_text = clean_text.replace('```json', '').replace('```', '')
                flashcards = json.loads(clean_text)
                return flashcards
            except Exception as e:
                print(f"Error generating flashcards for {source}: {e}")
                print(f"Raw response: {response.text if response else 'No response'}")
                return []

    def process_pdfs(self, folder_path: str) -> dict:
        pdf_folder = Path(folder_path)
        all_flashcards = []
        processed_files = []

        # Process each PDF in the folder
        for pdf_file in pdf_folder.glob('*.pdf'):
            print(f"\nProcessing: {pdf_file.name}")

            # Extract text from PDF
            content = self.extract_text_from_pdf(str(pdf_file))
            if not content:
                continue

            # Generate flashcards
            cards = self.generate_flashcards(content, pdf_file.name)
            if cards:
                all_flashcards.extend(cards)
                processed_files.append(pdf_file.name)
                print(f"Generated {len(cards)} flashcards from {pdf_file.name}")

            # Add delay between files
            time.sleep(2)

        # Prepare output
        result = {
            "summary": {
                "total_files": len(processed_files),
                "total_flashcards": len(all_flashcards),
                "processed_files": processed_files
            },
            "flashcards": all_flashcards
        }

        return result

def main():
    # Configuration
    dotenv.load_dotenv()
    API_KEY = os.getenv("API_KEY")  # Replace with your API key
    if not API_KEY:
        raise ValueError("API_KEY environment variable not set")
    PDF_FOLDER = r"D:\djsanghvi\notes\semester_5\isnew"   # Replace with your PDF folder path

    try:
        # Initialize generator
        generator = SimpleFlashcardGenerator(API_KEY)

        # Process PDFs and generate flashcards
        print(f"Processing PDFs from: {PDF_FOLDER}")
        result = generator.process_pdfs(PDF_FOLDER)

        # Save results
        with open("flashcards.json", "w") as f:
            json.dump(result, f, indent=2)

        # Print summary
        print("\nProcessing complete!")
        print(f"Total files processed: {result['summary']['total_files']}")
        print(f"Total flashcards generated: {result['summary']['total_flashcards']}")

        # Print sample flashcards
        if result['flashcards']:
            print("\nSample flashcards:")
            for card in result['flashcards'][:3]:  # Show first 3 cards
                print("\n---")
                print(f"Topic: {card['topic']}")
                print(f"Q: {card['question']}")
                print(f"A: {card['answer']}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
