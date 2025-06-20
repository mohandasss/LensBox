from sentence_transformers import SentenceTransformer, util
import pandas as pd
import torch

# ------------------------------
# Fix: Load CSV with robust comma handling
# ------------------------------
data = []
with open("Data.csv", "r", encoding="utf-8") as file:
    for line in file:
        line = line.strip()
        if not line:
            continue
        # Split on last comma
        parts = line.rsplit(",", 1)
        if len(parts) == 2:
            query, label = parts
            data.append((query.strip(), label.strip()))
        else:
            print(f"Skipping malformed line: {line}")

# Create DataFrame
df = pd.DataFrame(data, columns=["text", "label"])

# ------------------------------
# Load sentence transformer model
# ------------------------------
model = SentenceTransformer('all-MiniLM-L6-v2')

# Encode all known queries
corpus = df['text'].tolist()
corpus_embeddings = model.encode(corpus, convert_to_tensor=True)

# ------------------------------
# Predict intent
# ------------------------------
def predict_intent(user_input):
    input_embedding = model.encode(user_input, convert_to_tensor=True)
    similarities = util.pytorch_cos_sim(input_embedding, corpus_embeddings)

    best_match_idx = torch.argmax(similarities).item()
    best_score = similarities[0][best_match_idx].item()

    if best_score < 0.6:
        return "unknown"
    
    return df['label'].iloc[best_match_idx]
