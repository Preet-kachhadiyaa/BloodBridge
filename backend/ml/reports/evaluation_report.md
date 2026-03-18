# AIML Project Evaluation Report
    
## 1. Model Overview: Random Forest Regressor
The system uses a Random Forest Regressor to predict blood demand based on historical data.

### Performance Metrics:
- **R² Score (Accuracy):** 0.2422
- **Mean Squared Error (MSE):** 26.2601

### Features Used:
Hospital, Blood Group, Week, Holiday, Temperature

## 2. Donor Matching: KNN (K-Nearest Neighbors)
The system uses KNN to match donors based on geographic spatial proximity.
- **Algorithm:** Ball Tree (Optimized for spatial searches)
- **Distance Metric:** Euclidean distance on scaled coordinates.

## 3. Preprocessing Steps:
- **Normalization:** StandardScaler used for coordinates and age.
- **Label Encoding:** Multi-class encoding for Blood Groups and Hospital IDs.
- **Filtering:** Availability and Compatibility logic applied before AI matching.
