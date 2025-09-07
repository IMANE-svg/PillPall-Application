import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import os

class PatientClusterer:
    def __init__(self):
        self.model = KMeans(n_clusters=3, random_state=42, n_init=10)
        self.scaler = StandardScaler()
        self.labels = {0: "NON_ADHERENT", 1: "MODERATE", 2: "ADHERENT"}
        
    def fit(self, patient_data):
        features = self._extract_features(patient_data)
        scaled_features = self.scaler.fit_transform(features)
        self.model.fit(scaled_features)
        
    def predict(self, patient_data):
        features = self._extract_features(patient_data)
        scaled_features = self.scaler.transform(features)
        clusters = self.model.predict(scaled_features)
        return [self.labels[c] for c in clusters], self.model.cluster_centers_
    
    def _extract_features(self, patient_data):
        return np.array([
            [p['adherence_rate'], p['missed_doses'], p['average_delay'], p['total_prescriptions']]
            for p in patient_data  # Assume patient_data est list of dicts from request
        ])
    
    
    def save_model(self, path="models/kmeans_model.joblib"):
        """Sauvegarde du modèle"""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'labels': self.labels
        }, path)
    
    def load_model(self, path="models/kmeans_model.joblib"):
        """Chargement du modèle"""
        data = joblib.load(path)
        self.model = data['model']
        self.scaler = data['scaler']
        self.labels = data['labels']