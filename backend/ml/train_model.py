import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle
import os
import ssl
import urllib.request

# Fix SSL context for downloading
ssl._create_default_https_context = ssl._create_unverified_context

print("Downloading dataset from UCI...")
url = "https://archive.ics.uci.edu/ml/machine-learning-databases/blood-transfusion/transfusion.data"
df = pd.read_csv(url)

print(f"Dataset loaded. Shape: {df.shape}")

# Features and target
X = df.iloc[:, :-1]
y = df.iloc[:, -1]

# Rename columns for clarity
X.columns = ['Recency', 'Frequency', 'Monetary', 'Time']

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training Random Forest Classifier on structured tabular data...")
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"Model trained successfully. Test Accuracy: {acc:.4f}")

# Ensure ml directory exists
output_dir = os.path.dirname(os.path.abspath(__file__))
os.makedirs(output_dir, exist_ok=True)

model_path = os.path.join(output_dir, "donor_model.pkl")
with open(model_path, "wb") as f:
    pickle.dump(clf, f)

print(f"Model saved to {model_path}")
