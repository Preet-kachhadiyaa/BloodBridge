import pandas as pd
import numpy as np
import os
import random

# Ensure the ml directory exists
os.makedirs('backend/ml/data', exist_ok=True)

def generate_donor_data(n=2000):
    """Generates synthetic donor data for KNN matching"""
    blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    
    # Bangalore approximate bounds
    lat_min, lat_max = 12.85, 13.10
    lon_min, lon_max = 77.45, 77.75
    
    data = {
        'donor_id': [f"D{i:04d}" for i in range(n)],
        'lat': np.random.uniform(lat_min, lat_max, n),
        'lon': np.random.uniform(lon_min, lon_max, n),
        'blood_group': [random.choice(blood_groups) for _ in range(n)],
        'age': np.random.randint(18, 60, n),
        'last_donation_months': np.random.randint(0, 12, n),
        'weight_kg': np.random.randint(50, 100, n),
        'is_available': [random.random() > 0.2 for _ in range(n)] # 80% available
    }
    
    df = pd.DataFrame(data)
    df.to_csv('backend/ml/data/donors_training.csv', index=False)
    print(f"Generated {n} donor records.")

def generate_demand_data(n_hospitals=10, weeks=104):
    """Generates historical blood demand data for Random Forest prediction"""
    blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    hospital_names = [f"Hospital_{i}" for i in range(n_hospitals)]
    
    records = []
    
    for hospital in hospital_names:
        for week in range(weeks):
            for bg in blood_groups:
                # Base demand + seasonal trend + random noise
                base = random.randint(5, 20)
                seasonal = np.sin(week / 52 * 2 * np.pi) * 5
                demand = max(0, int(base + seasonal + random.randint(-3, 3)))
                
                records.append({
                    'hospital_name': hospital,
                    'week_index': week,
                    'blood_group': bg,
                    'units_required': demand,
                    'is_holiday': (week % 52) in [0, 51, 10, 31], # Christmas, New Year, Diwali etc
                    'avg_temp': 20 + seasonal + random.random() * 5
                })
                
    df = pd.DataFrame(records)
    df.to_csv('backend/ml/data/blood_demand_history.csv', index=False)
    print(f"Generated {len(df)} demand history records.")

if __name__ == "__main__":
    generate_donor_data()
    generate_demand_data()
