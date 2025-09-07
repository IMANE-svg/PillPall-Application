from sklearn.ensemble import IsolationForest
from sklearn.svm import OneClassSVM
import numpy as np
import joblib

class AnomalyDetector:
    def __init__(self):
        self.isolation_forest = IsolationForest(contamination=0.1, random_state=42)
        self.one_class_svm = OneClassSVM(nu=0.1)
        
    def detect_anomalies(self, events):
        """Détection d'anomalies avec multiple algorithmes"""
        features = self._extract_features(events)
        
        if_anomalies = self.isolation_forest.fit_predict(features)
        svm_anomalies = self.one_class_svm.fit_predict(features)
        
        # Combinaison des résultats
        combined_anomalies = np.logical_or(if_anomalies == -1, svm_anomalies == -1)
        
        return self._analyze_anomalies(events, combined_anomalies, features)
    
    def _extract_features(self, events):
        """Extraction des features pour la détection d'anomalies"""
        features = []
        for event in events:
            features.append([
                event.delay_minutes or 0,
                1 if event.status == "MISSED" else 0,
                1 if event.status == "CONFIRMED" else 0
            ])
        return np.array(features)
    
    def _analyze_anomalies(self, events, anomalies, features):
        """Analyse des types d'anomalies"""
        anomalous_events = [events[i] for i, is_anomaly in enumerate(anomalies) if is_anomaly]
        
        if not anomalous_events:
            return {"has_anomaly": False}
        
        # Détection du type d'anomalie
        if self._is_sudden_stop(anomalous_events):
            return {
                "has_anomaly": True,
                "anomaly_type": "SUDDEN_STOP",
                "severity": "HIGH",
                "explanation": "Arrêt soudain du traitement détecté"
            }
        elif self._is_overdose_pattern(anomalous_events):
            return {
                "has_anomaly": True,
                "anomaly_type": "POTENTIAL_OVERDOSE", 
                "severity": "CRITICAL",
                "explanation": "Prises trop rapprochées détectées"
            }
        else:
            return {
                "has_anomaly": True,
                "anomaly_type": "BEHAVIORAL_CHANGE",
                "severity": "MEDIUM",
                "explanation": "Changement de comportement détecté"
            }