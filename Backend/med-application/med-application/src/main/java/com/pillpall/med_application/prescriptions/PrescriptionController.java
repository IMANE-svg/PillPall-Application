package com.pillpall.med_application.prescriptions;

import com.pillpall.med_application.service.OcrService;
import com.pillpall.med_application.users.*;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {
    private final PrescriptionService service;
    private final UserRepository users;
    private final PatientProfileRepository patients;
    private final DoctorProfileRepository doctors;
    private final PrescriptionRepository prescriptions;
    private final OcrService ocrService;

    //L'ajout d'une prescription manuellement

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal String email, @RequestBody CreatePrescription req) {
        var user = users.findByEmail(email).orElseThrow();
        var doctor = doctors.findByUserId(user.getId()).orElseThrow();
        var patient = patients.findById(req.getPatientId()).orElseThrow();

        // Vérifier si le patient est suivi par ce doctor
        if (!patient.getDoctors().contains(doctor)) {
            return ResponseEntity.badRequest().body("Patient not under your care");
        }

        var p = Prescription.builder()
                .patient(patient)
                .doctor(doctor)
                .medicationName(req.getMedicationName())
                .dosage(req.getDosage())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .createdAt(Instant.now())
                .build();

        // Créer les DoseTime et lier à la prescription

        List<DoseTime> doseTimes = req.getDoseTimes().stream()
                .map(t -> DoseTime.builder()
                        .hour(t.getHour())
                        .minute(t.getMinute())
                        .prescription(p)
                        .build())
                .toList();
        p.setDoseTimes(doseTimes);

        var saved = service.createAndPlan(p, patient);
        return ResponseEntity.ok(saved.getId());
    }

    //Modification de la prescription

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @AuthenticationPrincipal String email,
            @PathVariable Long id,
            @RequestBody CreatePrescription req
    ) {
        var user = users.findByEmail(email).orElseThrow();
        var doctor = doctors.findByUserId(user.getId()).orElseThrow();
        var updated = service.update(id, req, doctor);
        return ResponseEntity.ok(new PrescriptionDTO(
                updated.getId(),
                updated.getMedicationName(),
                updated.getDosage(),
                updated.getStartDate(),
                updated.getEndDate(),
                updated.getPatient().getUser().getFullName(),
                updated.getPatient().getUser().getEmail(),
                updated.getDoctor().getUser().getFullName(),
                updated.getDoctor().getUser().getEmail(),
                updated.getCreatedAt(),
                updated.getDoseTimes().stream()
                        .map(dt -> new PrescriptionDTO.HM(dt.getHour(), dt.getMinute()))
                        .collect(Collectors.toList())
        ));
    }

    //Supression d'une prescription

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal String email, @PathVariable Long id) {
        var user = users.findByEmail(email).orElseThrow();
        var doctor = doctors.findByUserId(user.getId()).orElseThrow();
        service.delete(id, doctor);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class PrescriptionDTO {
        private final Long id;
        private final String medicationName;
        private final String dosage;
        private final LocalDate startDate;
        private final LocalDate endDate;
        private final String patientName;
        private final String patientEmail;
        private final String doctorName;
        private final String doctorEmail;
        private final Instant createdAt;
        private final List<HM> doseTimes;

        @Data
        public static class HM {
            private final int hour;
            private final int minute;
        }
    }

    // Endpoint pour consulter prescriptions par patient

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getByPatient(@AuthenticationPrincipal String email, @PathVariable Long patientId) {
        var user = users.findByEmail(email).orElseThrow();
        var doctor = doctors.findByUserId(user.getId()).orElseThrow();
        if (!prescriptions.existsByDoctorIdAndPatientId(doctor.getId(), patientId)) {
            return ResponseEntity.status(403).body("Patient not under your care");
        }
        List<PrescriptionDTO> dtos = prescriptions.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(p -> new PrescriptionDTO(
                        p.getId(),
                        p.getMedicationName(),
                        p.getDosage(),
                        p.getStartDate(),
                        p.getEndDate(),
                        p.getPatient().getUser().getFullName(),
                        p.getPatient().getUser().getEmail(),
                        p.getDoctor().getUser().getFullName(),
                        p.getDoctor().getUser().getEmail(),
                        p.getCreatedAt(),
                        p.getDoseTimes().stream()
                                .map(dt -> new PrescriptionDTO.HM(dt.getHour(), dt.getMinute()))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    //Ajouter une prescription par le scan d'un document

    @PostMapping("/scan")
    public ResponseEntity<?> scanDocument(@AuthenticationPrincipal String email, @RequestPart("file") MultipartFile file, @RequestParam Long patientId) {
        var user = users.findByEmail(email).orElseThrow();
        var doctor = doctors.findByUserId(user.getId()).orElseThrow();
        var patient = patients.findById(patientId).orElseThrow();

        if (!patient.getDoctors().contains(doctor)) {
            return ResponseEntity.badRequest().body("Patient not under your care");
        }

        Map<String, String> extracted = ocrService.extractFromImage(file);
        return ResponseEntity.ok(extracted); // Retourne les champs extraits pour le frontend
    }

    @Data
    public static class ScanReq extends CreatePrescription {
        private String scanData;  // JSON ou text from scan
    }



    @Data
    public static class CreatePrescription {
        @NotNull private Long patientId;
        @NotBlank private String medicationName;
        private String dosage;
        @NotNull private LocalDate startDate;
        @NotNull private LocalDate endDate;
        @NotNull private List<HM> doseTimes;
        @Data public static class HM { @Min(0) @Max(23) private int hour; @Min(0) @Max(59) private int minute; }
    }

}
