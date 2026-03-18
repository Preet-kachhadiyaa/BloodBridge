import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import mean_squared_error, r2_score
import os

def generate_evaluation_report():
    """Generates a detailed AIML Evaluation Report for academic submission"""
    os.makedirs('backend/ml/reports', exist_ok=True)
    
    # 1. Load Demand Prediction Metrics
    metrics = joblib.load('backend/ml/evaluation_metrics.pkl')
    
    report = f"""# AIML Project Evaluation Report
    
## 1. Model Overview: {metrics['model_name']}
The system uses a Random Forest Regressor to predict blood demand based on historical data.

### Performance Metrics:
- **R² Score (Accuracy):** {metrics['r2_score']:.4f}
- **Mean Squared Error (MSE):** {metrics['mse']:.4f}

### Features Used:
{', '.join(metrics['features'])}

## 2. Donor Matching: KNN (K-Nearest Neighbors)
The system uses KNN to match donors based on geographic spatial proximity.
- **Algorithm:** Ball Tree (Optimized for spatial searches)
- **Distance Metric:** Euclidean distance on scaled coordinates.

## 3. Preprocessing Steps:
- **Normalization:** StandardScaler used for coordinates and age.
- **Label Encoding:** Multi-class encoding for Blood Groups and Hospital IDs.
- **Filtering:** Availability and Compatibility logic applied before AI matching.
"""

    with open('backend/ml/reports/evaluation_report.md', 'w') as f:
        f.write(report)
        
    print("Evaluation Report generated at backend/ml/reports/evaluation_report.md")

if __name__ == "__main__":
    generate_evaluation_report()
