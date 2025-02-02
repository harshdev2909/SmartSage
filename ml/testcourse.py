import requests
import json

def test_generate_course():
    # Define the URL of the Flask endpoint
    url = "http://127.0.0.1:5000/course"  # Change this if your Flask server is hosted elsewhere

    # Path to the test file (replace with the actual file path you want to test)
    file_path = r"C:\Users\dwark\Downloads\Monte Carlo Method, ADL and Transfer Learning.pdf"  # Modify as per your file location

    try:
        # Open the file in binary mode and send it as part of the POST request
        with open(file_path, "rb") as file:
            files = {"file": (file_path.split("\\")[-1], file)}
            response = requests.post(url, files=files)

        # Print the response
        if response.status_code == 200:
            print("Response JSON:")
            # Beautify and print the response JSON
            response_json = response.json()
            beautified_json = json.dumps(response_json, indent=4, ensure_ascii=False)
            print(beautified_json)
        else:
            print(f"Error: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    test_generate_course()
