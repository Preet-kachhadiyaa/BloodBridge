# AIML MODULE: Random Forest Blood Demand Prediction
# Used for forecasting the units of blood a hospital will need in the future
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

def train_demand_model():
    """Trains a Random Forest Regressor to forecast blood demand"""
    # Load historical demand dataset
    df = pd.read_csv('backend/ml/data/blood_demand_history.csv')
    
    # Load categorical encoders (converts 'A+' or 'Hospital_1' to numbers)
    bg_encoder = joblib.load('backend/ml/models/demand_bg_encoder.pkl')
    hosp_encoder = joblib.load('backend/ml/models/hosp_encoder.pkl')
    
    # DATA PREPROCESSING: Numerical encoding
    df['bg_encoded'] = bg_encoder.transform(df['blood_group'])
    df['hosp_encoded'] = hosp_encoder.transform(df['hospital_name'])
    df['is_holiday'] = df['is_holiday'].astype(int)
    
    # FEATURE SELECTION: Inputs for the AI
    X = df[['hosp_encoded', 'bg_encoded', 'week_index', 'is_holiday', 'avg_temp']]
    y = df['units_required'] # Target output (The prediction)
    
    # EVALUATION SPLIT: 80% Training, 20% Testing
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # MODEL BUILDING: Random Forest (An ensemble of decision trees)
    # n_estimators=100 means the AI calculates 100 different trees and averages them
    rf = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    rf.fit(X_train, y_train)
    
    # EVALUATION: Calculate how accurate the model is
    y_pred = rf.predict(X_test)
    r2 = r2_score(y_test, y_pred) # Closer to 1.0 is better
    mse = mean_squared_error(y_test, y_pred)
    
    # Save model and performance metrics for the graduation report
    joblib.dump(rf, 'backend/ml/models/blood_demand_rf_model.pkl')
    
    metrics = {
        'model_name': 'Random Forest Regressor',
        'r2_score': r2,
        'mse': mse,
        'features': ['Hospital', 'Blood Group', 'Week', 'Holiday', 'Temperature']
    }
    joblib.dump(metrics, 'backend/ml/evaluation_metrics.pkl')
    
    print(f"Random Forest Demand model trained. R2 Score: {r2:.4f}")

def predict_demand(hospital_name, blood_group, week_index, is_holiday, avg_temp):
    """
    PREDICTION LOGIC: Takes real inputs and outputs a blood unit forecast
    """
    rf = joblib.load('backend/ml/models/blood_demand_rf_model.pkl')
    bg_encoder = joblib.load('backend/ml/models/demand_bg_encoder.pkl')
    hosp_encoder = joblib.load('backend/ml/models/hosp_encoder.pkl')
    
    try:
        # Convert user-readable text back into AI numbers
        h_enc = hosp_encoder.transform([hospital_name])[0]
        b_enc = bg_encoder.transform([blood_group])[0]
        
        X_input = [[h_enc, b_enc, week_index, int(is_holiday), avg_temp]]
        prediction = rf.predict(X_input)
        
        # Returns the rounded integer of predicted units
        return max(0, int(round(prediction[0])))
    except Exception as e:
        print(f"Prediction error: {e}")
        return 10 # Safety fallback value

if __name__ == "__main__":
    train_demand_model()
    # Test
    pred = predict_demand("Hospital_0", "O+", 105, False, 25)
    print(f"Predicted units for next week: {pred}")
