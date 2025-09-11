package com.pillpall.med_application.ml;

import com.pillpall.med_application.intakes.IntakeEvent;
import com.pillpall.med_application.intakes.IntakeEventRepository;
import com.pillpall.med_application.prescriptions.PrescriptionRepository;
import com.pillpall.med_application.users.PatientProfile;
import com.pillpall.med_application.users.PatientProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MlIntegrationService {

    //L'intégration du moteur intelligent : les modeles ML

    private final MlServiceClient mlClient;
    private final IntakeEventRepository intakeEventRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PatientAdherenceRepository adherenceRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final AnomalyDetectionRepository anomalyRepository;

    @Scheduled(cron = "0 0 3 * * *") // Tous les jours à 3h du matin
    @Transactional
    public void performDailyMlAnalysis() {
        clusterPatients();
        detectAnomaliesForAllPatients();
        updateRiskPredictions();
    }

    private void clusterPatients() {
        List<PatientAdherence> adherenceData = calculateAdherenceData();
        List<String> clusters = mlClient.clusterPatients(adherenceData);

        for (int i = 0; i < adherenceData.size(); i++) {
            PatientAdherence data = adherenceData.get(i);
            data.setSegment(clusters.get(i));
            adherenceRepository.save(data);
        }
    }

    private void detectAnomaliesForAllPatients() {
        List<PatientProfile> patients = patientProfileRepository.findAll();

        for (PatientProfile patient : patients) {
            List<IntakeEvent> recentEvents = intakeEventRepository
                    .findByPrescriptionPatientIdAndScheduledAtAfter(
                            patient.getId(),
                            Instant.now().minus(Duration.ofDays(7))
                    );

            Map<String, Object> anomalyResult = mlClient.detectAnomalies(patient.getId(), recentEvents);

            if (Boolean.TRUE.equals(anomalyResult.get("has_anomaly"))) {
                Anomaly anomaly = Anomaly.builder()
                        .patientId(patient.getId())
                        .type((String) anomalyResult.get("anomaly_type"))
                        .severity((String) anomalyResult.get("severity"))
                        .description((String) anomalyResult.get("explanation"))
                        .build();

                anomalyRepository.save(anomaly);
            }
        }
    }

    private void updateRiskPredictions() {
        List<PatientProfile> patients = patientProfileRepository.findAll();

        for (PatientProfile patient : patients) {
            List<IntakeEvent> historicalEvents = intakeEventRepository
                    .findByPrescriptionPatientId(patient.getId());

            Map<String, Object> riskPrediction = mlClient.predictRisk(patient.getId(), historicalEvents);
            saveRiskPrediction(patient.getId(), riskPrediction);
        }
    }

    // MÉTHODE IMPLÉMENTÉE
    private List<PatientAdherence> calculateAdherenceData() {
        List<PatientProfile> patients = patientProfileRepository.findAll();
        List<PatientAdherence> adherenceData = new ArrayList<>();

        for (PatientProfile patient : patients) {
            double adherenceRate = calculateAdherenceRate(patient.getId());
            int missedDoses = countMissedDosesLastWeek(patient.getId());
            double averageDelay = calculateAverageDelay(patient.getId());
            int totalPrescriptions = prescriptionRepository.countByPatientId(patient.getId());

            PatientAdherence data = PatientAdherence.builder()
                    .patientId(patient.getId())
                    .adherenceRate(adherenceRate)
                    .missedDoses(missedDoses)
                    .averageDelay(averageDelay)
                    .totalPrescriptions(totalPrescriptions)
                    .build();

            adherenceData.add(data);
        }

        return adherenceData;
    }

    // MÉTHODES DE CALCUL IMPLÉMENTÉES
    private double calculateAdherenceRate(Long patientId) {
        Instant oneWeekAgo = Instant.now().minus(Duration.ofDays(7));
        List<IntakeEvent> recentEvents = intakeEventRepository
                .findByPrescriptionPatientIdAndScheduledAtAfter(patientId, oneWeekAgo);

        if (recentEvents.isEmpty()) return 1.0;

        long total = recentEvents.size();
        long taken = recentEvents.stream()
                .filter(e -> e.getStatus() == IntakeEvent.Status.CONFIRMED)
                .count();

        return (double) taken / total;
    }

    private int countMissedDosesLastWeek(Long patientId) {
        Instant oneWeekAgo = Instant.now().minus(Duration.ofDays(7));
        return (int) intakeEventRepository
                .findByPrescriptionPatientIdAndScheduledAtAfter(patientId, oneWeekAgo)
                .stream()
                .filter(e -> e.getStatus() == IntakeEvent.Status.MISSED)
                .count();
    }

    private double calculateAverageDelay(Long patientId) {
        List<IntakeEvent> confirmedEvents = intakeEventRepository
                .findByPrescriptionPatientIdAndStatus(patientId, IntakeEvent.Status.CONFIRMED);

        if (confirmedEvents.isEmpty()) return 0.0;

        double totalDelay = confirmedEvents.stream()
                .filter(e -> e.getConfirmedAt() != null)
                .mapToDouble(e -> Duration.between(e.getScheduledAt(), e.getConfirmedAt()).toMinutes())
                .sum();

        return totalDelay / confirmedEvents.size();
    }

    private void saveRiskPrediction(Long patientId, Map<String, Object> prediction) {
        // Implémentation de la sauvegarde des prédictions
        RiskPrediction riskPrediction = RiskPrediction.builder()
                .patientId(patientId)
                .riskScore((Double) prediction.get("risk_score"))
                .willMiss((Boolean) prediction.get("will_miss"))
                .confidence((Double) prediction.get("confidence"))
                .build();


    }
}