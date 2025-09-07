package com.pillpall.med_application.service;

import com.pillpall.med_application.intakes.IntakeEvent;
import com.pillpall.med_application.intakes.IntakeEventRepository;
import com.pillpall.med_application.ml.PatientAdherence;
import com.pillpall.med_application.ml.PatientAdherenceRepository;
import com.pillpall.med_application.prescriptions.PrescriptionRepository;
import com.pillpall.med_application.users.PatientProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final PrescriptionRepository prescriptionRepository;
    private final IntakeEventRepository intakeEventRepository;
    private final PatientAdherenceRepository adherenceRepository;
    private final PatientProfileRepository patientProfileRepository;

    public Map<String, Object> calculateDoctorStats(Long doctorId) {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalPatients", prescriptionRepository.countDistinctPatientsByDoctorId(doctorId));
        stats.put("monthlyPrescriptions", prescriptionRepository.countByDoctorIdAndCreatedAtAfter(
                doctorId, Instant.now().minus(30, ChronoUnit.DAYS)));
        stats.put("averageAdherence", adherenceRepository.calculateAverageAdherenceForDoctorPatients(doctorId));

        // Calcul des alertes actives
        long activeAlerts = patientProfileRepository.findAll().stream()
                .filter(patient -> hasActiveAlerts(patient.getId()))
                .count();
        stats.put("activeAlerts", activeAlerts);

        return stats;
    }

    public Map<String, Object> calculatePatientStats(Long patientId) {
        Map<String, Object> stats = new HashMap<>();

        Instant oneWeekAgo = Instant.now().minus(7, ChronoUnit.DAYS);

        List<IntakeEvent> recentEvents = intakeEventRepository
                .findByPrescriptionPatientIdAndScheduledAtAfter(patientId, oneWeekAgo);

        long total = recentEvents.size();
        long confirmed = recentEvents.stream()
                .filter(e -> e.getStatus() == IntakeEvent.Status.CONFIRMED)
                .count();
        long missed = recentEvents.stream()
                .filter(e -> e.getStatus() == IntakeEvent.Status.MISSED)
                .count();

        stats.put("totalDosesLastWeek", total);
        stats.put("takenDosesLastWeek", confirmed);
        stats.put("missedDosesLastWeek", missed);
        stats.put("adherenceRateLastWeek", total > 0 ? (double) confirmed / total * 100 : 100.0);

        // Médicaments actifs
        long activePrescriptions = prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .filter(p -> !p.getEndDate().isBefore(LocalDate.now()))
                .count();
        stats.put("activePrescriptions", activePrescriptions);

        return stats;
    }

    private boolean hasActiveAlerts(Long patientId) {
        // Logique de détection d'alertes
        Optional<PatientAdherence> latestAdherence = adherenceRepository.findLatestByPatientId(patientId);
        return latestAdherence.isPresent() && latestAdherence.get().getAdherenceRate() < 0.5;
    }

    public Map<String, Long> getSegmentDistribution() {
        Map<String, Long> distribution = new HashMap<>();

        distribution.put("ADHERENT", adherenceRepository.countBySegment("ADHERENT"));
        distribution.put("MODERATE", adherenceRepository.countBySegment("MODERATE"));
        distribution.put("NON_ADHERENT", adherenceRepository.countBySegment("NON_ADHERENT"));

        return distribution;
    }
}