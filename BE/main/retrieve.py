import ollama
from pymongo import MongoClient
import numpy as np
import time

# Connect to MongoDB
client = MongoClient('mongodb+srv://kopi:kopi@cluster0.qbrkav0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['GoChat']
collection = db['questions_data']

prompt = input("Enter a prompt: ")

start_db_time = time.time()  # Start timing for database query

# Generate an embedding for the prompt
response = ollama.embeddings(prompt=prompt, model="llama3:8b-instruct-q4_0")
query_embedding = response["embedding"]

# Find the document with the closest embedding
closest_doc = None
min_distance = float('inf')

for doc in collection.find():
    question_title_embedding = np.array(doc['question_title_embedding'])
    distance = np.linalg.norm(query_embedding - question_title_embedding)
    if distance < min_distance:
        min_distance = distance
        closest_doc = doc

end_db_time = time.time()  # End timing for database query
db_execution_time = end_db_time - start_db_time

if closest_doc:
    start_model_time = time.time()  # Start timing for model generation
    
    # Generate a response using the retrieved data
    content = closest_doc['content']
    output = ollama.generate(
        model="llama3:8b-instruct-q4_0",
        prompt=f"Using this data: {content}. Respond to this prompt: {prompt}"
    )
    print(output['response'])
    
    end_model_time = time.time()  # End timing for model generation
    model_execution_time = end_model_time - start_model_time
    print("Model execution time:", model_execution_time, "seconds")
else:
    print("No relevant document found.")

print("Database execution time:", db_execution_time, "seconds")
