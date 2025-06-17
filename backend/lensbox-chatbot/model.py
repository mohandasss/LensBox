import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


data = {
    "text": [
        "I’m going to a wildlife trip",
        "Can I rent for 10 days",
        "What if I damage the camera?",
        "Tell me about IPL",
        "I'm shooting a wedding",
        "Is 5 days rental possible?",
        "What’s the policy if I break it?",
        "What's the best camera for vlogging?"
    ],
    "label": [
        "gear_suggestion",
        "rental_policy",
        "faq_damage",
        "unrelated",
        "gear_suggestion",
        "rental_policy",
        "faq_damage",
        "gear_suggestion"
    ]
}

df = pd.DataFrame(data)

# Create ML pipeline
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', LogisticRegression())
])

pipeline.fit(df['text'], df['label'])

# Function to use in app.py
def predict_intent(message):
    return pipeline.predict([message])[0]
