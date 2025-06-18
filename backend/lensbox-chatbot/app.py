from flask import Flask, request, jsonify
from model import predict_intent
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# ✅ Load responses dynamically from JSON file
with open('responses.json', 'r') as file:
    responses = json.load(file)

@app.route('/chatbot', methods=['POST'])
def chatbot():
    user_msg = request.json['message']
    intent = predict_intent(user_msg)
    reply = responses.get(intent, "Sorry, I didn't understand that intent.")
    return jsonify({"intent": intent, "response": reply})

if __name__ == '__main__':
    app.run(debug=True)
