from flask import Flask, render_template, request, jsonify
import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

app = Flask(__name__)

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv(os.path.join(os.getcwd(), 'project', '.env'))

# Configure Gemini AI with API key from environment variables
API_KEY = os.getenv('API_KEY')
genai.configure(api_key=API_KEY)

# Initialize the Gemini AI model
model = genai.GenerativeModel('gemini-1.5-flash')

def format_bold_text(text):
    # Replace **word** with <strong>word</strong>
    return re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    prompt = request.json['prompt']

    try:
        # Generate content using Gemini AI
        response = model.generate_content(prompt)

        # Extract bullet points, remove the introductory sentence, and format bold text
        bullet_points = []
        lines = response.text.strip().split('\n')
        for line in lines:
            if line.strip() and not line.startswith('Here are 5 effective ways to'):
                formatted_line = format_bold_text(line.strip())
                bullet_points.append(formatted_line)

        return jsonify({'response': bullet_points})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

