package com.pillpall.med_application.controller;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.pillpall.med_application.intakes.IntakeEvent;
import com.pillpall.med_application.intakes.IntakeEventRepository;
import com.pillpall.med_application.ml.Anomaly;
import com.pillpall.med_application.ml.AnomalyDetectionRepository;
import com.pillpall.med_application.ml.PatientAdherenceRepository;
import com.pillpall.med_application.prescriptions.Prescription;
import com.pillpall.med_application.prescriptions.PrescriptionDTO;
import com.pillpall.med_application.prescriptions.PrescriptionRepository;
import com.pillpall.med_application.users.DoctorProfileRepository;
import com.pillpall.med_application.users.PatientProfile;
import com.pillpall.med_application.users.PatientProfileRepository;
import com.pillpall.med_application.users.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor/reports")
@RequiredArgsConstructor
public class ReportController {

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
                                            @RequestParam(required = false) LocalDate from,
                                            @RequestParam(required = false) LocalDate to) {
        try {
            // Vérifier les paramètres from et to
            if (from == null || to == null) {
                return ResponseEntity.badRequest().body("Les paramètres 'from' et 'to' sont requis au format YYYY-MM-DD");
            }

            var user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
            var doctor = doctorRepository.findByUserId(user.getId()).orElseThrow(() -> new IllegalArgumentException("Médecin non trouvé"));

            PatientProfile patient = patientProfileRepository.findById(patientId)
                    .orElseThrow(() -> new IllegalArgumentException("Patient non trouvé"));
            if (!patient.getDoctors().contains(doctor)) {
                return ResponseEntity.status(403).body("Patient not under your care");
            }

            Instant start = from.atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant end = to.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

            // Infos patient
            Map<String, Object> report = new HashMap<>();
            report.put("patientInfo", new PatientInfo(
                    patient.getUser().getFullName(),
                    patient.getUser().getEmail(),
                    patient.getBirthDate()
            ));

            // Prescriptions dans période
            List<Prescription> prescriptions = prescriptionRepository.findByPatientIdAndDateRange(patientId, from, to);
            List<PrescriptionDTO> prescriptionDTOs = prescriptions != null
                    ? prescriptions.stream()
                    .map(p -> new PrescriptionDTO(
                            p.getId(),
                            p.getMedicationName(),
                            p.getDosage(),
                            p.getStartDate(),
                            p.getEndDate(),
                            p.getPatient().getUser().getFullName(),
                            p.getPatient().getUser().getEmail(),
                            p.getCreatedAt()
                    ))
                    .toList()
                    : Collections.emptyList();
            report.put("prescriptions", prescriptionDTOs);

            // Bilan observance
            List<IntakeEvent> events = intakeEventRepository.findByPrescriptionPatientIdAndScheduledAtBetween(patientId, start, end);
            double adherenceRate = events != null && !events.isEmpty()
                    ? (double) events.stream().filter(e -> e.getStatus() == IntakeEvent.Status.CONFIRMED).count() / events.size()
                    : 0.0;
            long missedDoses = events != null
                    ? events.stream().filter(e -> e.getStatus() == IntakeEvent.Status.MISSED).count()
                    : 0L;
            report.put("adherenceRate", adherenceRate);
            report.put("missedDoses", missedDoses);

            // Anomalies et dangers
            List<Anomaly> anomalies = anomalyDetectionRepository.findAnomaliesByPatientIdAndDateRange(patientId, start, end);
            List<AnomalyDTO> anomalyDTOs = anomalies != null
                    ? anomalies.stream()
                    .map(a -> new AnomalyDTO(a.getType(), a.getSeverity(), a.getDescription(), a.getDetectedAt()))
                    .toList()
                    : Collections.emptyList();
            boolean hasDanger = anomalies != null && anomalies.stream().anyMatch(a -> a.getSeverity().equals("HIGH") || a.getSeverity().equals("CRITICAL"));
            report.put("anomalies", anomalyDTOs);
            report.put("hasDanger", hasDanger);

            // Si le rapport est vide
            if (prescriptionDTOs.isEmpty() && anomalyDTOs.isEmpty() && adherenceRate == 0.0 && missedDoses == 0) {
                return ResponseEntity.ok().body(Map.of(
                        "message", "Aucune donnée disponible pour ce patient dans la période spécifiée",
                        "report", report
                ));
            }

            return ResponseEntity.ok(report);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }

    //Generation du rapport sous forme pdf

    @GetMapping("/{patientId}/pdf")
    public ResponseEntity<byte[]> generateReportPdf(@AuthenticationPrincipal String email,
                                                    @PathVariable Long patientId,
                                                    @RequestParam(required = false) LocalDate from,
                                                    @RequestParam(required = false) LocalDate to) {
        try {
            // Vérifier les paramètres from et to
            if (from == null || to == null) {
                return ResponseEntity.badRequest().body(null);
            }

            var user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
            var doctor = doctorRepository.findByUserId(user.getId()).orElseThrow(() -> new IllegalArgumentException("Médecin non trouvé"));

            PatientProfile patient = patientProfileRepository.findById(patientId)
                    .orElseThrow(() -> new IllegalArgumentException("Patient non trouvé"));
            if (!patient.getDoctors().contains(doctor)) {
                return ResponseEntity.status(403).body(null);
            }

            Instant start = from.atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant end = to.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

            // Générer le PDF
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("Rapport Médical - PillPall")
                    .setFontSize(16)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Informations du patient").setFontSize(14).setBold());
            document.add(new Paragraph("Nom: " + patient.getUser().getFullName()));
            document.add(new Paragraph("Email: " + patient.getUser().getEmail()));
            document.add(new Paragraph("Date de naissance: " + (patient.getBirthDate() != null ? patient.getBirthDate().toString() : "N/A")));

            document.add(new Paragraph("Prescriptions").setFontSize(14).setBold().setMarginTop(10));
            List<Prescription> prescriptions = prescriptionRepository.findByPatientIdAndDateRange(patientId, from, to);
            Table prescriptionTable = new Table(4);
            prescriptionTable.addHeaderCell("Médicament");
            prescriptionTable.addHeaderCell("Dosage");
            prescriptionTable.addHeaderCell("Date début");
            prescriptionTable.addHeaderCell("Date fin");
            if (prescriptions != null && !prescriptions.isEmpty()) {
                for (Prescription p : prescriptions) {
                    prescriptionTable.addCell(p.getMedicationName() != null ? p.getMedicationName() : "N/A");
                    prescriptionTable.addCell(p.getDosage() != null ? p.getDosage() : "N/A");
                    prescriptionTable.addCell(p.getStartDate() != null ? p.getStartDate().toString() : "N/A");
                    prescriptionTable.addCell(p.getEndDate() != null ? p.getEndDate().toString() : "N/A");
                }
            } else {
                prescriptionTable.addCell("Aucune prescription");
                prescriptionTable.addCell("");
                prescriptionTable.addCell("");
                prescriptionTable.addCell("");
            }
            document.add(prescriptionTable);

            List<IntakeEvent> events = intakeEventRepository.findByPrescriptionPatientIdAndScheduledAtBetween(patientId, start, end);
            double adherenceRate = events != null && !events.isEmpty()
                    ? (double) events.stream().filter(e -> e.getStatus() == IntakeEvent.Status.CONFIRMED).count() / events.size()
                    : 0.0;
            long missedDoses = events != null
                    ? events.stream().filter(e -> e.getStatus() == IntakeEvent.Status.MISSED).count()
                    : 0L;
            document.add(new Paragraph("Observance").setFontSize(14).setBold().setMarginTop(10));
            document.add(new Paragraph("Taux d'observance: " + String.format("%.2f%%", adherenceRate * 100)));
            document.add(new Paragraph("Doses manquées: " + missedDoses));

            document.add(new Paragraph("Anomalies").setFontSize(14).setBold().setMarginTop(10));
            List<Anomaly> anomalies = anomalyDetectionRepository.findAnomaliesByPatientIdAndDateRange(patientId, start, end);
            Table anomalyTable = new Table(4);
            anomalyTable.addHeaderCell("Type");
            anomalyTable.addHeaderCell("Sévérité");
            anomalyTable.addHeaderCell("Description");
            anomalyTable.addHeaderCell("Date");
            if (anomalies != null && !anomalies.isEmpty()) {
                for (Anomaly a : anomalies) {
                    anomalyTable.addCell(a.getType() != null ? a.getType() : "N/A");
                    anomalyTable.addCell(a.getSeverity() != null ? a.getSeverity() : "N/A");
                    anomalyTable.addCell(a.getDescription() != null ? a.getDescription() : "N/A");
                    anomalyTable.addCell(a.getDetectedAt() != null ? a.getDetectedAt().toString() : "N/A");
                }
            } else {
                anomalyTable.addCell("Aucune anomalie");
                anomalyTable.addCell("");
                anomalyTable.addCell("");
                anomalyTable.addCell("");
            }
            document.add(anomalyTable);

            boolean hasDanger = anomalies != null && anomalies.stream().anyMatch(a -> a.getSeverity() != null && (a.getSeverity().equals("HIGH") || a.getSeverity().equals("CRITICAL")));
            document.add(new Paragraph("Danger détecté: " + (hasDanger ? "Oui" : "Non")).setFontSize(14).setBold().setMarginTop(10));

            document.close();

            byte[] pdfBytes = baos.toByteArray();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "rapport-" + patientId + ".pdf");

            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(null);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @Data
    public static class PatientInfo {
        private final String fullName;
        private final String email;
        private final LocalDate birthDate;
    }

    @Data
    public static class AnomalyDTO {
        private final String type;
        private final String severity;
        private final String description;
        private final Instant detectedAt;
    }
}