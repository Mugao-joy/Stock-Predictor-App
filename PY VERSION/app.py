from flask import Flask, jsonify
from dotenv import load_dotenv
import os

# Load env variables
load_dotenv()

app = Flask(__name__)

@app.route('/get-keys', methods=['GET'])
def get_keys():
    openai_key = os.getenv('OPENAI_API_KEY')
   # polygon_key = os.getenv('POLYGON_API_KEY')

    if not openai_key :#or not polygon_key:
        return jsonify({"error": "Missing one or more API keys"}), 500

    # Don't expose these in production! Just for local dev/demo
    return jsonify({
        "openai": openai_key,
        #"polygon": polygon_key
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
