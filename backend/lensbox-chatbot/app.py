from flask import Flask, request, jsonify
from model import predict_intent
import json
import random
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load responses with multiple options per intent
with open('responses.json', 'r', encoding='utf-8') as file:
    responses = json.load(file)

@app.route('/chatbot', methods=['POST'])
def chatbot():
    user_msg = request.json.get('message', '')
    
    if not user_msg:
        return jsonify({"error": "Empty message"}), 400

    intent = predict_intent(user_msg)
    possible_replies = responses.get(intent)

    if not possible_replies:
        reply = "Sorry, I didn't understand."
    else:
        reply = random.choice(possible_replies)

    return (
        jsonify({"intent": intent, "response": reply}),
        200,
        {'Content-Type': 'application/json; charset=utf-8'}
    )

if __name__ == '__main__':
    app.run(debug=True)