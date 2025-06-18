from flask import Flask, request, jsonify
from model import predict_intent
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ✅ Load responses from JSON file with emoji/text
with open('responses.json', 'r', encoding='utf-8') as file:
    responses = json.load(file)

@app.route('/chatbot', methods=['POST'])
def chatbot():
    user_msg = request.json['message']
    intent = predict_intent(user_msg)
    reply = responses.get(intent, "Sorry, I didn't understand that intent.")
    
    # ✅ Force UTF-8 content type for emoji-safe responses
    return (
        jsonify({"intent": intent, "response": reply}),
        200,
        {'Content-Type': 'application/json; charset=utf-8'}
    )

if __name__ == '__main__':
    app.run(debug=True)
