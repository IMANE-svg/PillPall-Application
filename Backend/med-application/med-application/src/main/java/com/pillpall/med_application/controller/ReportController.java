package com.pillpall.med_application.controller;

import com.pillpall.med_application.intakes.IntakeEvent;
import com.pillpall.med_application.intakes.IntakeEventRepository;
import com.pillpall.med_application.ml.Anomaly;
import com.pillpall.med_application.ml.AnomalyDetectionRepository;
import com.pillpall.med_application.ml.PatientAdherenceRepository;
import com.pillpall.med_application.prescriptions.Prescription;
import com.pillpall.med_application.prescriptions.PrescriptionRepository;
import com.pillpall.med_application.users.DoctorProfileRepository;
import com.pillpall.med_application.users.PatientProfile;
import com.pillpall.med_application.users.PatientProfileRepository;
import com.pillpall.med_application.users.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor/reports")
@RequiredArgsConstructor
public class ReportController {

    //Controlleur dédié pour la génération des rapport par le médecin
    //Le rapport contient les informations du patient et son comportement pendant une période choisie par le médecin

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final IntakeEventRepository intakeEventRepository;
    private final PatientAdherenceRepository adherenceRepository;
    private final AnomalyDetectionRepository anomalyDetectionRepository;
    private final PatientProfileRepository patientProfileRepository;

    @GetMapping("/{patientId}")
    public ResponseEntity<?> generateReport(@AuthenticationPrincipal String email,
                                            @PathVariable Long patientId,
                                            @RequestParam LocalDate from,
                                            @RequestParam LocalDate to) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var doctor = doctorRepository.findByUserId(user.getId()).orElseThrow();

        if (!prescriptionRepository.existsByDoctorIdAndPatientId(doctor.getId(), patientId)) {
            return ResponseEntity.status(403).body("Patient not under your care");
        }

        Instant start = from.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant end = to.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        // Infos patient
        PatientProfile patient = patientProfileRepository.findById(patientId).orElseThrow();
        Map<String, Object> report = new HashMap<>();
        report.put("patientInfo", new PatientInfo(patient.getUser().getFullName(), patient.getUser().getEmail(), patient.getBirthDate()));

        // Prescriptions dans période
        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdAndDate(patientId, from);  // Adapte query si besoin

        // Bilan observance
        List<IntakeEvent> events = intakeEventRepository.findByPrescriptionPatientIdAndScheduledAtBetween(patientId, start, end);
        double adherenceRate = events.isEmpty() ? 1.0 : (double) events.stream().filter(e -> e.getStatus() == IntakeEvent.Status.CONFIRMED).count() / events.size();
        report.put("adherenceRate", adherenceRate);
        report.put("missedDoses", events.stream().filter(e -> e.getStatus() == IntakeEvent.Status.MISSED).count());

        // Anomalies et dangers
        List<Anomaly> anomalies = anomalyDetectionRepository.findRecentAnomaliesByPatientId(patientId);  // Pour période, adapte si besoin
        boolean hasDanger = anomalies.stream().anyMatch(a -> a.getSeverity().equals("HIGH") || a.getSeverity().equals("CRITICAL"));
        report.put("anomalies", anomalies);
        report.put("hasDanger", hasDanger);

        return ResponseEntity.ok(report);
    }

    @Data
    public static class PatientInfo {
        private final String fullName;
        private final String email;
        private final LocalDate birthDate;
    }
}