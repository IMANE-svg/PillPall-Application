package com.pillpall.med_application.controller;

import com.pillpall.med_application.intakes.IntakeEvent;
import com.pillpall.med_application.intakes.IntakeEventRepository;
import com.pillpall.med_application.ml.MlServiceClient;
import com.pillpall.med_application.prescriptions.PrescriptionRepository;
import com.pillpall.med_application.service.AnalyticsService;
import com.pillpall.med_application.users.PatientProfileRepository;
import com.pillpall.med_application.users.Specialty;
import com.pillpall.med_application.users.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
public class PatientDashboardController {

    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final IntakeEventRepository intakeEventRepository;
    private final AnalyticsService analyticsService;
    private final MlServiceClient mlServiceClient;

    //Les statistiaues et des recommendations

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var patient = patientProfileRepository.findByUserId(user.getId()).orElseThrow();

        Map<String, Object> dashboard = new HashMap<>();

        // Statistiques
        dashboard.put("stats", analyticsService.calculatePatientStats(patient.getId()));

        // Médicaments à venir (prochaines 24h)
        dashboard.put("upcomingMedications", getUpcomingMedications(patient.getId()));

        // Recommandations
        dashboard.put("recommendations", getRecommendations(patient.getId()));

        // Prescriptions actives
        dashboard.put("activePrescriptions", getActivePrescriptions(patient.getId()));

        return ResponseEntity.ok(dashboard);
    }

    //le médicament à venir

    @GetMapping("/medications/upcoming")
    public ResponseEntity<?> getUpcomingMedications(@AuthenticationPrincipal String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var patient = patientProfileRepository.findByUserId(user.getId()).orElseThrow();

        return ResponseEntity.ok(getUpcomingMedications(patient.getId()));
    }

    @GetMapping("/prescriptions/active")
    public ResponseEntity<?> getActivePrescriptions(@AuthenticationPrincipal String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var patient = patientProfileRepository.findByUserId(user.getId()).orElseThrow();

        return ResponseEntity.ok(getActivePrescriptions(patient.getId()));
    }

    //Lùhistoriaue des prises

    @GetMapping("/history")
    public ResponseEntity<?> getIntakeHistory(@AuthenticationPrincipal String email,
                                              @RequestParam(defaultValue = "7") int days) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var patient = patientProfileRepository.findByUserId(user.getId()).orElseThrow();

        Instant startDate = Instant.now().minus(java.time.Duration.ofDays(days));

        List<IntakeEvent> events = intakeEventRepository
                .findByPrescriptionPatientIdAndScheduledAtAfter(patient.getId(), startDate);

        List<IntakeHistory> history = events.stream()
                .map(event -> new IntakeHistory(
                        event.getScheduledAt(),
                        event.getStatus().name(),
                        event.getConfirmedAt(),
                        event.getPrescription().getMedicationName(),
                        event.getPrescription().getDosage()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(history);
    }



    private List<MedicationAlert> getUpcomingMedications(Long patientId) {
        Instant now = Instant.now();
        Instant next24Hours = now.plus(java.time.Duration.ofHours(24));

        List<IntakeEvent> upcomingEvents = intakeEventRepository
                .findByPrescriptionPatientIdAndScheduledAtBetweenAndStatus(
                        patientId, now, next24Hours, IntakeEvent.Status.PENDING);

        return upcomingEvents.stream()
                .map(event -> new MedicationAlert(
                        event.getId(),
                        event.getPrescription().getMedicationName(),
                        event.getPrescription().getDosage(),
                        event.getScheduledAt(),
                        event.getPrescription().getDoctor().getUser().getFullName()
                ))
                .collect(Collectors.toList());
    }

    private List<PrescriptionInfo> getActivePrescriptions(Long patientId) {
        return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .filter(p -> !p.getEndDate().isBefore(java.time.LocalDate.now()))
                .map(p -> new PrescriptionInfo(
                        p.getId(),
                        p.getMedicationName(),
                        p.getDosage(),
                        p.getStartDate(),
                        p.getEndDate(),
                        p.getDoctor().getUser().getFullName(),
                        p.getDoctor().getSpecialty()
                ))
                .collect(Collectors.toList());
    }

    private List<String> getRecommendations(Long patientId) {
        List<IntakeEvent> historicalEvents = intakeEventRepository
                .findByPrescriptionPatientId(patientId);

        Map<String, Object> prediction = mlServiceClient.predictRisk(patientId, historicalEvents);

        List<String> recommendations = new ArrayList<>();

        if (Boolean.TRUE.equals(prediction.get("will_miss"))) {
            recommendations.add(" Risque élevé d'oubli de prise. Activez des rappels supplémentaires.");
        }


        return recommendations;
    }

    // DTO Classes
    @Data
    public static class IntakeHistory {
        private final Instant scheduledTime;
        private final String status;
        private final Instant actualTime;
        private final String medication;
        private final String dosage;
    }

    @Data
    public static class MedicationAlert {
        private final Long eventId;
        private final String medication;
        private final String dosage;
        private final Instant scheduledTime;
        private final String prescribedBy;
    }

    @Data
    public static class PrescriptionInfo {
        private final Long id;
        private final String medication;
        private final String dosage;
        private final java.time.LocalDate startDate;
        private final java.time.LocalDate endDate;
        private final String doctorName;
        private final Specialty specialty;
    }
}
