# import firebase_admin
# from firebase_admin import credentials, firestore
# import pandas as pd

# # Initialize Firebase with your service account key
# cred = credentials.Certificate('./serviceAccountKey.json')  
# firebase_admin.initialize_app(cred)

# # Initialize Firestore
# db = firestore.client()

# # Define a function to fetch data from Firestore
# def fetch_data():
#     # Query Firestore - Change this to your collection or query path
#     collection_ref = db.collection("userrequests")  # Replace with your collection name
#     docs = collection_ref.stream()

#     # Extract the data
#     data = []
#     for doc in docs:
#         data.append(doc.to_dict())  # Convert Firestore document to dictionary

#     return data

# # Call the function and load the data into pandas DataFrame
# data = fetch_data()

# # If data exists, load into a pandas DataFrame for analysis
# if data:
#     df = pd.DataFrame(data)
#     print("Data loaded into DataFrame:")
#     print(df.head())  # Display the first few rows of data
# else:
#     print("No data found.")

import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

# Initialize Firebase with your service account key
cred = credentials.Certificate('./serviceAccountKey.json')  
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# Define a function to fetch data from Firestore
def fetch_data():
    # Query Firestore - Change this to your collection or query path
    collection_ref = db.collection("inventory")  # Replace with your collection name
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
    
    # Data Cleaning
    # Convert timestamp to datetime (assuming your 'timestamp' is in string format)
    df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')  # Convert 'timestamp' column to datetime
    
    # Handle missing data (e.g., fill NaN values with zeros)
    df.fillna(0, inplace=True)  # Replace NaN with 0
    
    # Print the cleaned dataframe
    print("Data loaded into DataFrame and cleaned:")
    print(df.head())  # Display the first few rows of the cleaned data
    
    # --- Linear Regression for Sales Prediction ---
    # Example sales data (replace this with your actual sales or quantity data)
    sales_data = pd.DataFrame({
        'date': pd.date_range(start='1/1/2023', periods=12, freq='M'),
        'sales': [100, 120, 150, 160, 200, 220, 250, 300, 320, 350, 400, 450]
    })

    # Convert dates to numeric (e.g., number of days since start)
    sales_data['date_numeric'] = (sales_data['date'] - sales_data['date'].min()).dt.days

    # Prepare features and target for regression
    X = sales_data[['date_numeric']]  # Features (date_numeric)
    y = sales_data['sales']  # Target (sales)

    # Train a Linear Regression model
    model = LinearRegression()
    model.fit(X, y)

    # Predict future sales (e.g., for next month)
    next_month = np.array([[sales_data['date_numeric'].max() + 30]])  # Predict next month's sales
    predicted_sales = model.predict(next_month)

    print(f"Predicted sales for next month: {predicted_sales[0]}")

else:
    print("No data found.")
