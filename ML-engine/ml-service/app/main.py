from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import *
from .models.kmeans_cluster import PatientClusterer
from .models.risk_predictor import RiskPredictor
from .models.anomaly_detector import AnomalyDetector
import joblib
import os

app = FastAPI(title="ML Medical Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://192.168.1.11:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialisation des modèles
clusterer = PatientClusterer()
risk_predictor = RiskPredictor()
anomaly_detector = AnomalyDetector()



@app.post("/cluster-patients", response_model=ClusterResponse)
async def cluster_patients(request: List[dict]):  # Changé à List[dict] pour match Java requestData
    try:
        clusters, centroids = clusterer.predict(request)
        return {
            "clusters": clusters,
            "centroids": centroids.tolist(),
            "labels": list(clusterer.labels.values())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-risk", response_model=PredictionResponse)
async def predict_risk(request: dict):  # Changé à dict pour match Java
    try:
        patient_id = request['patient_id']
        historical_events = request['historical_events']  # List of dicts
        
        # Calcul patient_data dynamique
        patient_data = {
            'adherence_rate': sum(1 for e in historical_events if e['status'] == 'CONFIRMED') / len(historical_events) if historical_events else 1.0,
            'missed_doses': sum(1 for e in historical_events if e['status'] == 'MISSED'),
            'average_delay': sum(e['delay_minutes'] or 0 for e in historical_events if e['status'] == 'CONFIRMED') / sum(1 for e in historical_events if e['status'] == 'CONFIRMED') or 0,
            'total_prescriptions': len(set(e['medication'] for e in historical_events))
        }
        
        prediction = risk_predictor.predict_risk(patient_data, historical_events)
        
        return {
            "patient_id": patient_id,
            "risk_score": prediction['risk_score'],
            "will_miss": prediction['will_miss'],
            "confidence": prediction['confidence'],
            "recommended_reminder_time": request['current_time']  # Ajoute logique personnalisée si besoin
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-anomalies", response_model=AnomalyResponse)
async def detect_anomalies(request: AnomalyRequest):
    try:
        result = anomaly_detector.detect_anomalies(request.patient_events)
        return {
            "patient_id": request.patient_events[0].patient_id if request.patient_events else 0,
            "has_anomaly": result["has_anomaly"],
            "anomaly_type": result.get("anomaly_type"),
            "severity": result.get("severity"),
            "explanation": result.get("explanation")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train-models")
async def train_models(training_data: dict):  # Ajoute param pour data
    try:
        # Example: assume training_data a X_rf, y_rf, etc.
        risk_predictor.train_models(training_data.get('X_rf', []), training_data.get('y_rf', []), 
                                    training_data.get('X_lstm', []), training_data.get('y_lstm', []))
        return {"status": "success", "message": "Models trained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)