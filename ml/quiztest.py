import requests

# API endpoint for testing
url = "http://127.0.0.1:5000/upload_pdf"  # Make sure this matches your endpoint

# Provide the correct path to the temporary PDF file (sample.pdf)
files = {
    'file': open(r"D:\djsanghvi\notes\semester_5\tsa\Module 5.pdf", 'rb')  # Replace with your sample PDF file path
}
data = {
    'user_id': 'user_1',
    'prompt': 'Test upload functionality'  # Replace with your prompt if needed
}

# Send POST request
response = requests.post(url, files=files, data=data)

# Print the response status and data
print(f"Status Code: {response.status_code}")
try:
    # Try printing the JSON response
    print("Response JSON:")
    print(response.json())
except Exception as e:
    # Print raw text if JSON decoding fails
    print("Error:", e)
    print("Response Text:")
    print(response.text)
