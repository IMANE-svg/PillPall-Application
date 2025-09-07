package com.pillpall.med_application.controller;

import com.pillpall.med_application.intakes.IntakeEvent;
import com.pillpall.med_application.intakes.IntakeEventRepository;
import com.pillpall.med_application.ml.AnomalyDetectionRepository;
import com.pillpall.med_application.ml.PatientAdherence;
import com.pillpall.med_application.ml.PatientAdherenceRepository;
import com.pillpall.med_application.prescriptions.Prescription;
import com.pillpall.med_application.prescriptions.PrescriptionRepository;
import com.pillpall.med_application.users.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorController {
    private final DoctorProfileRepository doctorRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final IntakeEventRepository intakeEventRepository;
    private final PatientAdherenceRepository adherenceRepository;
    private final UserRepository userRepository;
    private final AnomalyDetectionRepository anomalyDetectionRepository;

    //Endpoint publique pour Afficher les médecins aux patients pendant l'inscription

    @GetMapping("/public")
    public ResponseEntity<?> listPublic() {
        List<DoctorProfile> doctors = doctorRepository.findAll();
        List<DoctorInfo> doctorInfos = doctors.stream()
                .map(doctor -> new DoctorInfo(
                        doctor.getId(),
                        doctor.getUser().getFullName(),
                        doctor.getUser().getEmail(),
                        doctor.getSpecialty(),
                        doctor.getUser().isEnabled()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(doctorInfos);
    }
    //Statistiques

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDoctorStats(@AuthenticationPrincipal String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var doctor = doctorRepository.findByUserId(user.getId()).orElseThrow();

        Map<String, Object> stats = new HashMap<>();

        // Nombre total de patients
        long totalPatients = prescriptionRepository.countDistinctPatientsByDoctorId(doctor.getId());
        stats.put("totalPatients", totalPatients);

        // Prescriptions ce mois-ci
        Instant monthStart = Instant.now().minus(Duration.ofDays(30));
        long monthlyPrescriptions = prescriptionRepository.countByDoctorIdAndCreatedAtAfter(doctor.getId(), monthStart);
        stats.put("monthlyPrescriptions", monthlyPrescriptions);

        // Taux d'observance moyen
        Double averageAdherence = adherenceRepository.calculateAverageAdherenceForDoctorPatients(doctor.getId());
        stats.put("averageAdherence", averageAdherence != null ? averageAdherence : 0.0);

        // Alertes actives : basé sur anomalies non résolues pour patients du doctor
        List<PatientProfile> patients = prescriptionRepository.findDistinctPatientsByDoctorId(doctor.getId());
        long activeAlerts = patients.stream()
                .filter(p -> !anomalyDetectionRepository.findByPatientIdAndResolvedFalse(p.getId()).isEmpty())
                .count();
        stats.put("activeAlerts", activeAlerts);

        return ResponseEntity.ok(stats);
    }

    //Les observances

    @GetMapping("/patients/{patientId}/observance")
    public ResponseEntity<?> getPatientObservance(
            @AuthenticationPrincipal String email,
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "7") int days) {

        var user = userRepository.findByEmail(email).orElseThrow();
        var doctor = doctorRepository.findByUserId(user.getId()).orElseThrow();

        // Vérifier que le patient appartient au docteur
        if (!prescriptionRepository.existsByDoctorIdAndPatientId(doctor.getId(), patientId)) {
            return ResponseEntity.status(403).body("Patient not under your care");
        }

        Instant startDate = Instant.now().minus(Duration.ofDays(days));

        List<IntakeEvent> events = intakeEventRepository
                .findByPrescriptionPatientIdAndScheduledAtAfter(patientId, startDate);

        List<ObservanceData> observanceData = events.stream()
                .map(event -> new ObservanceData(
                        event.getScheduledAt(),
                        event.getStatus().name(),
                        event.getConfirmedAt(),
                        event.getPrescription().getMedicationName()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(observanceData);
    }


    //Les patients de ce médecin
    @GetMapping("/patients")
    public ResponseEntity<?> getDoctorPatients(@AuthenticationPrincipal String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var doctor = doctorRepository.findByUserId(user.getId()).orElseThrow();

        List<PatientProfile> patients = prescriptionRepository.findDistinctPatientsByDoctorId(doctor.getId());

        List<PatientInfo> patientInfos = patients.stream()
                .map(patient -> {
                    Optional<PatientAdherence> latestAdherence = adherenceRepository
                            .findLatestByPatientId(patient.getId());

                    return new PatientInfo(
                            patient.getId(),
                            patient.getUser().getFullName(),
                            latestAdherence.map(PatientAdherence::getAdherenceRate).orElse(0.0),
                            latestAdherence.map(PatientAdherence::getSegment).orElse("UNKNOWN")
                    );
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(patientInfos);
    }

    //L'historique des prescriptions Ordonnées de la plus réecente vers l'ancienne

    @GetMapping("/prescriptions/recent")
    public ResponseEntity<?> getRecentPrescriptions(@AuthenticationPrincipal String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var doctor = doctorRepository.findByUserId(user.getId()).orElseThrow();

        Instant weekAgo = Instant.now().minus(Duration.ofDays(7));
        List<Prescription> recentPrescriptions = prescriptionRepository
                .findByDoctorIdAndCreatedAtAfterOrderByCreatedAtDesc(doctor.getId(), weekAgo);

        return ResponseEntity.ok(recentPrescriptions);
    }

    @GetMapping("/prescriptions/history")
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var doctor = doctorRepository.findByUserId(user.getId()).orElseThrow();
        return ResponseEntity.ok(prescriptionRepository.findByDoctorIdOrderByCreatedAtDesc(doctor.getId()));
    }

    // DTO Classes
    @Data
    public static class ObservanceData {
        private final Instant scheduledTime;
        private final String status;
        private final Instant actualTime;
        private final String medication;
    }

    @Data
    public static class PatientInfo {
        private final Long id;
        private final String fullName;
        private final Double adherenceRate;
        private final String segment;
    }

    @Data
    public static class DoctorInfo {
        private final Long id;
        private final String fullName;
        private final String email;
        private final Specialty specialty;
        private final boolean enabled;


    }
}