from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PatientData(BaseModel):
    patient_id: int
    adherence_rate: float
    missed_doses: int
    average_delay: float
    total_prescriptions: int

class IntakeEvent(BaseModel):
    event_id: int
    patient_id: int
    medication: str
    scheduled_time: datetime
    actual_time: Optional[datetime]
    status: str  # CONFIRMED, MISSED, PENDING
    delay_minutes: Optional[float]

class ClusterRequest(BaseModel):
    patients: List[PatientData]

class PredictionRequest(BaseModel):
    patient_id: int
    historical_events: List[IntakeEvent]
    current_time: datetime

class AnomalyRequest(BaseModel):
    patient_events: List[IntakeEvent]

class ClusterResponse(BaseModel):
    clusters: List[int]
    centroids: List[List[float]]
    labels: List[str]

class PredictionResponse(BaseModel):
    patient_id: int
    risk_score: float
    will_miss: bool
    confidence: float
    recommended_reminder_time: Optional[datetime]

class AnomalyResponse(BaseModel):
    patient_id: int
    has_anomaly: bool
    anomaly_type: Optional[str]
    severity: Optional[str]
    explanation: Optional[str]