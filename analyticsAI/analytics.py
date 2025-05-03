import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd

# Initialize Firebase with your service account key
cred = credentials.Certificate('./serviceAccountKey.json')  
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# Define a function to fetch data from Firestore
def fetch_data():
    # Query Firestore - Change this to your collection or query path
    collection_ref = db.collection("userrequests")  # Replace with your collection name
    docs = collection_ref.stream()

    # Extract the data
    data = []
    for doc in docs:
        data.append(doc.to_dict())  # Convert Firestore document to dictionary

    return data

# Call the function and load the data into pandas DataFrame
data = fetch_data()

# If data exists, load into a pandas DataFrame for analysis
if data:
    df = pd.DataFrame(data)
    print("Data loaded into DataFrame:")
    print(df.head())  # Display the first few rows of data
else:
    print("No data found.")
