# AIML MODULE: KNN Donor Matching Algorithm
# Used for finding the 10 closest compatible blood donors based on GPS coordinates
import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
import joblib
import os

def train_donor_model():
    """Trains a KNN model to facilitate spatial searching of donors"""
    # Load the synthetic training dataset
    df = pd.read_csv('backend/ml/data/donors_training.csv')
    
    # Load preprocessing tools (Scaler and Encoders)
    scaler = joblib.load('backend/ml/models/donor_scaler.pkl')
    
    # AIML PREPROCESSING: Scale Latitude, Longitude, and Age
    # This prevents one feature (like Age) from dominating the 'distance' calculation
    X = scaler.transform(df[['lat', 'lon', 'age']])
    
    # KNN MODEL: Initialize with Ball Tree algorithm
    # Ball Tree is highly efficient for geospatial (lat/lon) distance lookups
    knn = NearestNeighbors(n_neighbors=10, algorithm='ball_tree')
    knn.fit(X)
    
    # Save the trained model for real-time API use
    joblib.dump(knn, 'backend/ml/models/donor_knn_model.pkl')
    print("KNN Donor Matching model trained and saved.")

def get_matching_donors(user_lat, user_lon, user_bg, num_donors=5):
    """
    PREDICTION LOGIC: Finds compatible donors near the requester
    """
    # Load model and encoders
    knn = joblib.load('backend/ml/models/donor_knn_model.pkl')
    scaler = joblib.load('backend/ml/models/donor_scaler.pkl')
    df = pd.read_csv('backend/ml/data/donors_training.csv')
    
    # 1. BIOLOGICAL FILTERING: Check blood group compatibility
    # Donors must be same type or O- (Universal Donor)
    compatible_groups = [user_bg]
    if user_bg != 'O-':
        compatible_groups.append('O-')
        
    filtered_df = df[df['blood_group'].isin(compatible_groups) & (df['is_available'] == True)]
    
    if filtered_df.empty:
        return []
    
    # 2. DATA PREPROCESSING: Scale the input user coordinates
    input_point = scaler.transform([[user_lat, user_lon, 30]])
    
    # 3. SPATIAL SEARCH: Find K-Nearest Neighbors
    X_filtered = scaler.transform(filtered_df[['lat', 'lon', 'age']])
    knn_temp = NearestNeighbors(n_neighbors=min(num_donors, len(filtered_df)), algorithm='ball_tree')
    knn_temp.fit(X_filtered)
    
    distances, indices = knn_temp.kneighbors(input_point)
    
    # 4. RESULTS: Return the data to the frontend
    results = filtered_df.iloc[indices[0]].copy()
    results['distance_score'] = distances[0]
    
    return results.to_dict('records')

if __name__ == "__main__":
    train_donor_model()
    # Test
    matches = get_matching_donors(12.97, 77.59, 'B+')
    print(f"Test match count: {len(matches)}")
