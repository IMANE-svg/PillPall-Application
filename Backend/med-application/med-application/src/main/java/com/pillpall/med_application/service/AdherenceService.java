package com.pillpall.med_application.service;

import com.pillpall.med_application.intakes.IntakeEvent;
import com.pillpall.med_application.intakes.IntakeEventRepository;
import com.pillpall.med_application.ml.PatientAdherence;
import com.pillpall.med_application.ml.PatientAdherenceRepository;
import com.pillpall.med_application.prescriptions.PrescriptionRepository;
import com.pillpall.med_application.users.PatientProfile;
import com.pillpall.med_application.users.PatientProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdherenceService {
    private final IntakeEventRepository intakeEventRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PatientAdherenceRepository adherenceRepository;
    private final PatientProfileRepository patientProfileRepository;

    public double calculateAdherenceRate(Long patientId) {
        Instant oneWeekAgo = Instant.now().minus(Duration.ofDays(7));

        List<IntakeEvent> recentEvents = intakeEventRepository
                .findByPrescriptionPatientIdAndScheduledAtAfter(patientId, oneWeekAgo);

        if (recentEvents.isEmpty()) return 1.0; // Aucun événement = parfait adherence

        long totalDoses = recentEvents.size();
        long takenDoses = recentEvents.stream()
                .filter(e -> e.getStatus() == IntakeEvent.Status.CONFIRMED)
                .count();

        return (double) takenDoses / totalDoses;
    }

    public int countMissedDosesLastWeek(Long patientId) {
        Instant oneWeekAgo = Instant.now().minus(Duration.ofDays(7));

        return (int) intakeEventRepository
                .findByPrescriptionPatientIdAndScheduledAtAfter(patientId, oneWeekAgo)
                .stream()
                .filter(e -> e.getStatus() == IntakeEvent.Status.MISSED)
                .count();
    }

    public double calculateAverageDelay(Long patientId) {
        List<IntakeEvent> confirmedEvents = intakeEventRepository
                .findByPrescriptionPatientIdAndStatus(patientId, IntakeEvent.Status.CONFIRMED);

        if (confirmedEvents.isEmpty()) return 0.0;

        double totalDelay = confirmedEvents.stream()
                .filter(e -> e.getConfirmedAt() != null)
                .mapToDouble(e -> Duration.between(e.getScheduledAt(), e.getConfirmedAt()).toMinutes())
                .sum();

        return totalDelay / confirmedEvents.size();
    }

    @Transactional
    public PatientAdherence calculateAndSaveAdherence(Long patientId) {
        double adherenceRate = calculateAdherenceRate(patientId);
        int missedDoses = countMissedDosesLastWeek(patientId);
        double averageDelay = calculateAverageDelay(patientId);
        int totalPrescriptions = prescriptionRepository.countByPatientId(patientId);

        PatientAdherence adherence = PatientAdherence.builder()
                .patientId(patientId)
                .adherenceRate(adherenceRate)
                .missedDoses(missedDoses)
                .averageDelay(averageDelay)
                .totalPrescriptions(totalPrescriptions)
                .build();

        return adherenceRepository.save(adherence);
    }

    @Transactional
    public void calculateAllPatientsAdherence() {
        List<PatientProfile> patients = patientProfileRepository.findAll();

        for (PatientProfile patient : patients) {
            calculateAndSaveAdherence(patient.getId());
        }
    }
}