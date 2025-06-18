import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline



df = pd.read_csv("Data.csv")




pipeline = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', LogisticRegression())
])

pipeline.fit(df['text'], df['label'])


def predict_intent(message):
    return pipeline.predict([message])[0]
