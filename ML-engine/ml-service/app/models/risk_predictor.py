import numpy as np
from sklearn.ensemble import RandomForestClassifier
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import StandardScaler
import joblib
from datetime import datetime, timedelta
import pandas as pd

class RiskPredictor:
    def __init__(self):
        self.rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.lstm_model = self._build_lstm_model()
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def _build_lstm_model(self):
        """Construction du modèle LSTM"""
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(7, 4)),
            Dropout(0.2),
            LSTM(50),
            Dropout(0.2),
            Dense(1, activation='sigmoid')
        ])
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        return model
    
    def prepare_time_series_data(self, events):
        """Préparation des données temporelles pour LSTM"""
        if not events:
            return np.array([])
            
        # Convertir en DataFrame
        df = pd.DataFrame([{
            'timestamp': e.scheduled_time,
            'status': 1 if e.status == "CONFIRMED" else 0,
            'delay': e.delay_minutes or 0,
            'medication_count': 1
        } for e in events])
        
        # Grouper par jour
        df['date'] = pd.to_datetime(df['timestamp']).dt.date
        daily_data = df.groupby('date').agg({
            'status': 'mean',
            'delay': 'mean',
            'medication_count': 'count'
        }).reset_index()
        
        # Créer des séries temporelles de 7 jours
        time_series = []
        for i in range(len(daily_data) - 6):
            window = daily_data.iloc[i:i+7]
            features = window[['status', 'delay', 'medication_count']].values
            # Normaliser et pad si nécessaire
            if len(features) < 7:
                features = np.pad(features, ((0, 7-len(features)), (0, 0)), mode='constant')
            time_series.append(features)
        
        return np.array(time_series)
    
    def train_models(self, X_rf, y_rf, X_lstm, y_lstm):
        """Entraînement des deux modèles"""
        if len(X_rf) > 0:
            self.rf_model.fit(X_rf, y_rf)
        
        # Entraînement LSTM
        if len(X_lstm) > 0 and len(X_lstm) == len(y_lstm):
            X_lstm_scaled = self.scaler.fit_transform(X_lstm.reshape(-1, 4)).reshape(-1, 7, 4)
            self.lstm_model.fit(X_lstm_scaled, y_lstm, epochs=10, batch_size=32, verbose=0)
        
        self.is_trained = True
    
    def predict_risk(self, patient_data, historical_events):
        if not self.is_trained:
            return {
                'risk_score': 0.5,
                'will_miss': False,
                'confidence': 0.0
            }
        
        # Calcul dynamique from events
        confirmed_events = [e for e in historical_events if e['status'] == "CONFIRMED"]
        missed_events = [e for e in historical_events if e['status'] == "MISSED"]
        
        adherence_rate = len(confirmed_events) / len(historical_events) if historical_events else 1.0
        missed_doses = len(missed_events)
        
        average_delay = 0.0
        if confirmed_events:
            total_delay = sum(e['delay_minutes'] or 0 for e in confirmed_events)
            average_delay = total_delay / len(confirmed_events)
        
        rf_features = [adherence_rate, missed_doses, average_delay, len(historical_events)]
        rf_pred = self.rf_model.predict_proba([rf_features])[0][1] if hasattr(self.rf_model, 'classes_') else 0.5
        
        lstm_pred = 0.5
        time_series_data = self.prepare_time_series_data(historical_events)  # Adapte pour dicts
        if len(time_series_data) > 0:
            time_series_scaled = self.scaler.transform(time_series_data.reshape(-1, 4)).reshape(-1, 7, 4)
            lstm_pred = self.lstm_model.predict(time_series_scaled, verbose=0)[0][0]
        
        final_risk = 0.6 * rf_pred + 0.4 * lstm_pred
        
        return {
            'risk_score': final_risk,
            'will_miss': final_risk > 0.7,
            'confidence': abs(final_risk - 0.5) * 2
        }
    def _extract_rf_features(self, patient_data, historical_events):
        """Extraction des features pour Random Forest"""
        # Calculer les features en temps réel
        confirmed_events = [e for e in historical_events if e.status == "CONFIRMED"]
        missed_events = [e for e in historical_events if e.status == "MISSED"]
        
        adherence_rate = len(confirmed_events) / len(historical_events) if historical_events else 1.0
        missed_doses = len(missed_events)
        
        # Délai moyen
        average_delay = 0.0
        if confirmed_events:
            total_delay = sum(e.delay_minutes or 0 for e in confirmed_events)
            average_delay = total_delay / len(confirmed_events)
        
        return [
            adherence_rate,
            missed_doses,
            average_delay,
            len(historical_events)
        ]
    
    def save_model(self, path="models/risk_predictor.joblib"):
        """Sauvegarde du modèle"""
        import os
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({
            'rf_model': self.rf_model,
            'scaler': self.scaler,
            'is_trained': self.is_trained
        }, path)
    
    def load_model(self, path="models/risk_predictor.joblib"):
        """Chargement du modèle"""
        data = joblib.load(path)
        self.rf_model = data['rf_model']
        self.scaler = data['scaler']
        self.is_trained = data['is_trained']