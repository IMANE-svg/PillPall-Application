package com.pillpall.med_application.controller;

import com.pillpall.med_application.intakes.IntakeEvent;
import com.pillpall.med_application.intakes.IntakeEventRepository;
import com.pillpall.med_application.ml.MlServiceClient;
import com.pillpall.med_application.prescriptions.Prescription;
import com.pillpall.med_application.prescriptions.PrescriptionRepository;
import com.pillpall.med_application.service.AnalyticsService;
import com.pillpall.med_application.users.PatientProfileRepository;
import com.pillpall.med_application.users.Specialty;
import com.pillpall.med_application.users.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
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
    private static final Logger log = LoggerFactory.getLogger(PatientDashboardController.class);

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var patient = patientProfileRepository.findByUserId(user.getId()).orElseThrow();

        // Générer les événements d'observance pour les prescriptions actives
        generateIntakeEvents(patient.getId());

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("stats", analyticsService.calculatePatientStats(patient.getId()));
        dashboard.put("upcomingMedications", getUpcomingMedications(patient.getId()));
        dashboard.put("recommendations", getRecommendations(patient.getId()));
        dashboard.put("activePrescriptions", getActivePrescriptions(patient.getId()));

        return ResponseEntity.ok(dashboard);
    }

    //La prochaine prise

    @GetMapping("/medications/upcoming")
    public ResponseEntity<?> getUpcomingMedications(@AuthenticationPrincipal String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var patient = patientProfileRepository.findByUserId(user.getId()).orElseThrow();
        generateIntakeEvents(patient.getId());
        return ResponseEntity.ok(getUpcomingMedications(patient.getId()));
    }

    //Lister les prescriptions du patient

    @GetMapping("/prescriptions/active")
    public ResponseEntity<?> getActivePrescriptions(@AuthenticationPrincipal String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var patient = patientProfileRepository.findByUserId(user.getId()).orElseThrow();
        return ResponseEntity.ok(getActivePrescriptions(patient.getId()));
    }

    //L'historique des prises

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

    private void generateIntakeEvents(Long patientId) {
        log.info("Generating intake events for patientId: {}", patientId);
        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .filter(p -> !p.getEndDate().isBefore(LocalDate.now()))
                .collect(Collectors.toList());

        Instant now = Instant.now();
        Instant next24Hours = now.plus(java.time.Duration.ofHours(24));

        for (Prescription prescription : prescriptions) {
            LocalDate startDate = prescription.getStartDate();
            LocalDate endDate = prescription.getEndDate();
            LocalDate today = LocalDate.now();

            // Générer des événements pour aujourd'hui et demain si dans la période active
            for (LocalDate date = today; date.isBefore(endDate.plusDays(1)) && date.isAfter(startDate.minusDays(1)); date = date.plusDays(1)) {
                for (var doseTime : prescription.getDoseTimes()) {
                    int hour = doseTime.getHour();
                    int minute = doseTime.getMinute();
                    // Vérifier si l'heure et la minute sont valides
                    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
                        log.warn("Invalid doseTime for prescriptionId: {}, hour: {}, minute: {}",
                                prescription.getId(), hour, minute);
                        continue;
                    }
                    LocalDateTime scheduledDateTime = LocalDateTime.of(date,
                            java.time.LocalTime.of(hour, minute));
                    Instant scheduledAt = scheduledDateTime.atZone(ZoneId.systemDefault()).toInstant();

                    // Vérifier si l'événement existe déjà
                    boolean eventExists = intakeEventRepository
                            .findByPrescriptionIdAndScheduledAt(prescription.getId(), scheduledAt)
                            .isPresent();

                    if (!eventExists && scheduledAt.isAfter(now) && scheduledAt.isBefore(next24Hours)) {
                        IntakeEvent event = new IntakeEvent();
                        event.setPrescription(prescription);
                        event.setScheduledAt(scheduledAt);
                        event.setStatus(IntakeEvent.Status.PENDING);
                        intakeEventRepository.save(event);
                        log.info("Created intake event for prescriptionId: {}, scheduledAt: {}",
                                prescription.getId(), scheduledAt);
                    }
                }
            }
        }
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
                .sorted((a, b) -> a.getScheduledTime().compareTo(b.getScheduledTime()))
                .collect(Collectors.toList());
    }

    private List<PrescriptionInfo> getActivePrescriptions(Long patientId) {
        return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .filter(p -> !p.getEndDate().isBefore(LocalDate.now()))
                .map(p -> new PrescriptionInfo(
                        p.getId(),
                        p.getMedicationName(),
                        p.getDosage(),
                        p.getStartDate(),
                        p.getEndDate(),
                        p.getDoctor().getUser().getFullName(),
                        p.getDoctor().getSpecialty(),
                        p.getDoseTimes().stream()
                                .map(dt -> new PrescriptionInfo.HM(dt.getHour(), dt.getMinute()))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
    }

    private List<String> getRecommendations(Long patientId) {
        List<IntakeEvent> historicalEvents = intakeEventRepository.findByPrescriptionPatientId(patientId);
        Map<String, Object> prediction = mlServiceClient.predictRisk(patientId, historicalEvents);
        List<String> recommendations = new ArrayList<>();
        if (Boolean.TRUE.equals(prediction.get("will_miss"))) {
            recommendations.add("Risque élevé d'oubli de prise. Activez des rappels supplémentaires.");
        }
        return recommendations;
    }

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
        private final List<HM> doseTimes;
        @Data
        public static class HM {
            private final int hour;
            private final int minute;
        }
    }
}