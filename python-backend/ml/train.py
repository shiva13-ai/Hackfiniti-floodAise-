import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
import pickle
import os

MODEL_PATH = "python-backend/model.pkl"

def train_rf_model(X, y):
    """
    Trains the Random Forest model on the Kaggle Flood Prediction Dataset features.
    Features: [NDWI, Elevation, Slope, Distance_to_River, Rainfall]
    """
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    rf_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    rf_model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = rf_model.predict(X_test)
    y_prob = rf_model.predict_proba(X_test)[:, 1]
    
    metrics = {
        "accuracy": accuracy_score(y_test, y_pred),
        "f1": f1_score(y_test, y_pred),
        "auc": roc_auc_score(y_test, y_prob),
        "precision": precision_score(y_test, y_pred),
        "recall": recall_score(y_test, y_pred)
    }
    
    # Ensure directory exists before saving
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(rf_model, f)
        
    return metrics

def load_rf_model():
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    return None

def predict_flood_risk(features):
    """Predicts flood probability using the trained RF model."""
    model = load_rf_model()
    if model:
        return model.predict_proba(features)[:, 1]
    
    # Fallback to analytical calculation if no model exists (Demo mode)
    # Features: [NDWI, Elevation, Slope, Distance_to_River, Rainfall]
    ndwi, elev, slope, dist, rain = features[0], features[1], features[2], features[3], features[4]
    
    # Heuristic weighting mimicking the RF output
    prob = (ndwi * 0.4) + (rain / 500 * 0.3) + (1 / (elev + 1) * 0.15) + (1 / (slope + 1) * 0.1) + (1 / (dist + 1) * 0.05)
    return np.clip(prob, 0, 1)

if __name__ == "__main__":
    # Generate synthetic Kaggle-aligned dataset for initial training
    # [NDWI (0-1), Elevation (0-200m), Slope (0-45deg), Distance (0-10000m), Rainfall (0-500mm)]
    np.random.seed(42)
    N_SAMPLES = 5000
    
    X_synthetic = np.column_stack((
        np.random.uniform(0, 1, N_SAMPLES),      # NDWI
        np.random.uniform(0, 200, N_SAMPLES),    # Elevation
        np.random.uniform(0, 45, N_SAMPLES),     # Slope
        np.random.uniform(0, 10000, N_SAMPLES),  # Distance
        np.random.uniform(0, 500, N_SAMPLES)     # Rainfall
    ))
    
    # Define "true" labels based on a hidden threshold combination
    # High NDWI, low elevation, low slope, high rain -> Flood (1)
    y_synthetic = ((X_synthetic[:, 0] > 0.4) & (X_synthetic[:, 1] < 30) & (X_synthetic[:, 4] > 150)).astype(int)
    
    print("Training Random Forest on synthetic Kaggle data...")
    metrics = train_rf_model(X_synthetic, y_synthetic)
    print(f"Metrics: {metrics}")
