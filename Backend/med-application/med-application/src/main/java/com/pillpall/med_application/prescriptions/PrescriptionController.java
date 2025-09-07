package com.pillpall.med_application.prescriptions;

import com.pillpall.med_application.service.OcrService;
import com.pillpall.med_application.users.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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

        // Vérif si le patient est suivi par ce doctor (via nouvelle relation)
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
                .doseTimes(req.getDoseTimes().stream()
                        .map(t -> DoseTime.builder().hour(t.getHour()).minute(t.getMinute()).build()).toList())
                .build();

        var saved = service.createAndPlan(p, patient);
        return ResponseEntity.ok(saved.getId());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@AuthenticationPrincipal String email, @PathVariable Long id, @RequestBody CreatePrescription req) {
        var user = users.findByEmail(email).orElseThrow();
        var doctor = doctors.findByUserId(user.getId()).orElseThrow();
        var prescription = prescriptions.findById(id).orElseThrow();

        if (!prescription.getDoctor().equals(doctor)) {
            return ResponseEntity.status(403).body("Not your prescription");
        }

        prescription.setMedicationName(req.getMedicationName());
        prescription.setDosage(req.getDosage());
        prescription.setStartDate(req.getStartDate());
        prescription.setEndDate(req.getEndDate());
        prescription.setDoseTimes(req.getDoseTimes().stream()
                .map(t -> DoseTime.builder().hour(t.getHour()).minute(t.getMinute()).build()).toList());

        // Régénérer events si dates/horaires changent
        service.generateEvents(prescription);
        prescriptions.save(prescription);
        return ResponseEntity.ok(prescription.getId());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal String email, @PathVariable Long id) {
        var user = users.findByEmail(email).orElseThrow();
        var doctor = doctors.findByUserId(user.getId()).orElseThrow();
        var prescription = prescriptions.findById(id).orElseThrow();

        if (!prescription.getDoctor().equals(doctor)) {
            return ResponseEntity.status(403).body("Not your prescription");
        }

        prescriptions.delete(prescription);
        return ResponseEntity.ok().build();
    }

    // Endpoint pour consulter prescriptions par patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getByPatient(@AuthenticationPrincipal String email, @PathVariable Long patientId) {
        var user = users.findByEmail(email).orElseThrow();
        var doctor = doctors.findByUserId(user.getId()).orElseThrow();
        if (!prescriptions.existsByDoctorIdAndPatientId(doctor.getId(), patientId)) {
            return ResponseEntity.status(403).body("Patient not under your care");
        }
        return ResponseEntity.ok(prescriptions.findByPatientIdOrderByCreatedAtDesc(patientId));
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
        @NotNull private Long patientId;  // Changé de doctorId à patientId
        @NotBlank private String medicationName;
        private String dosage;
        @NotNull private LocalDate startDate;
        @NotNull private LocalDate endDate;
        @NotNull private List<HM> doseTimes;
        @Data public static class HM { @Min(0) @Max(23) private int hour; @Min(0) @Max(59) private int minute; }
    }
}