import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import os

# Ensure model directory exists
os.makedirs('backend/ml/models', exist_ok=True)

def preprocess_donor_data(file_path='backend/ml/data/donors_training.csv'):
    """Preprocesses donor data for KNN"""
    df = pd.read_csv(file_path)
    
    # Cleaning: Drop missing values (if any)
    df = df.dropna()
    
    # Encoding: Blood group (A+, B-, etc to 0, 1, 2...)
    bg_encoder = LabelEncoder()
    df['bg_encoded'] = bg_encoder.fit_transform(df['blood_group'])
    
    # Scaling: Coordinates and Age for distance calculation
    scaler = StandardScaler()
    coords_scaled = scaler.fit_transform(df[['lat', 'lon', 'age']])
    
    # Save objects for real-time API use
    joblib.dump(bg_encoder, 'backend/ml/models/bg_encoder.pkl')
    joblib.dump(scaler, 'backend/ml/models/donor_scaler.pkl')
    
    print("Donor data preprocessed and scaler saved.")
    return df

def preprocess_demand_data(file_path='backend/ml/data/blood_demand_history.csv'):
    """Preprocesses demand data for Random Forest"""
    df = pd.read_csv(file_path)
    
    # Cleaning
    df = df.dropna()
    
    # Label Encoding for categorical data
    bg_encoder = LabelEncoder()
    hosp_encoder = LabelEncoder()
    
    df['bg_encoded'] = bg_encoder.fit_transform(df['blood_group'])
    df['hosp_encoded'] = hosp_encoder.fit_transform(df['hospital_name'])
    
    # Convert holiday to binary
    df['is_holiday'] = df['is_holiday'].astype(int)
    
    # Save encoders
    joblib.dump(bg_encoder, 'backend/ml/models/demand_bg_encoder.pkl')
    joblib.dump(hosp_encoder, 'backend/ml/models/hosp_encoder.pkl')
    
    print("Demand history preprocessed and encoders saved.")
    return df

if __name__ == "__main__":
    preprocess_donor_data()
    preprocess_demand_data()
