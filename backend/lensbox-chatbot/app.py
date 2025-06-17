from flask import Flask, request, jsonify
from model import predict_intent

app = Flask(__name__)

# Hardcoded replies for each intent
responses = {
    "gear_suggestion": "For wildlife trips, we suggest DSLR + telephoto lens. For weddings, go with 35mm or 50mm lens.",
    "faq_damage": "If gear is damaged, the customer is charged based on repair or replacement cost.",
    "rental_policy": "Yes, you can rent gear for any duration between 1 and 30 days.",
    "unrelated": "I'm an assistant for camera gear rentals. Ask me about equipment, rentals, or trip advice 😊"
}

@app.route('/chatbot', methods=['POST'])
def chatbot():
    user_msg = request.json['message']
    intent = predict_intent(user_msg)
    reply = responses.get(intent, "Sorry, I didn't understand that.")
    return jsonify({"intent": intent, "response": reply})

if __name__ == '__main__':
    app.run(debug=True)
