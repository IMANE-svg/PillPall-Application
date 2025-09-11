package com.pillpall.med_application.prescriptions;

import com.pillpall.med_application.intakes.IntakeEvent;
import com.pillpall.med_application.intakes.IntakeEventRepository;
import com.pillpall.med_application.users.DoctorProfile;
import com.pillpall.med_application.users.PatientProfile;
import com.pillpall.med_application.users.PatientProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class PrescriptionService {
    private final PrescriptionRepository prescriptions;
    private final IntakeEventRepository intakes;
    private final PatientProfileRepository patients;
    private final IntakeEventRepository intakeEvents;

    @Transactional
    public Prescription createAndPlan(Prescription p, PatientProfile patient) {
        p.setPatient(patient);
        Prescription saved = prescriptions.save(p);
        generateEvents(saved);
        return saved;
    }

    @Transactional
    public void generateEvents(Prescription p) {
        ZoneId tz = ZoneId.of(p.getPatient().getUser().getTimezone());
        for (LocalDate d = p.getStartDate(); !d.isAfter(p.getEndDate()); d = d.plusDays(1)) {
            for (DoseTime dt : p.getDoseTimes()) {
                ZonedDateTime zdt = ZonedDateTime.of(d, LocalTime.of(dt.getHour(), dt.getMinute()), tz);
                intakes.save(IntakeEvent.builder()
                        .prescription(p)
                        .scheduledAt(zdt.toInstant())
                        .status(IntakeEvent.Status.PENDING)
                        .build());
            }
        }
    }
    @Transactional
    public Prescription update(Long id, PrescriptionController.CreatePrescription req, DoctorProfile doctor) {
        Prescription prescription = prescriptions.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Prescription not found"));
        if (!prescription.getDoctor().equals(doctor)) {
            throw new IllegalStateException("Not your prescription");
        }
        PatientProfile patient = patients.findById(req.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        if (!patient.getDoctors().contains(doctor)) {
            throw new IllegalStateException("Patient not under your care");
        }

        prescription.setMedicationName(req.getMedicationName());
        prescription.setDosage(req.getDosage());
        prescription.setStartDate(req.getStartDate());
        prescription.setEndDate(req.getEndDate());

        // Supprimer les anciens doseTimes

        prescription.getDoseTimes().clear();

        // Ajouter les nouveaux doseTimes avec lien à la prescription

        List<DoseTime> newDoseTimes = req.getDoseTimes().stream()
                .map(hm -> {
                    DoseTime dt = new DoseTime();
                    dt.setHour(hm.getHour());
                    dt.setMinute(hm.getMinute());
                    dt.setPrescription(prescription); // Associer explicitement à la prescription
                    return dt;
                })
                .collect(Collectors.toList());
        prescription.getDoseTimes().addAll(newDoseTimes);

        return prescriptions.save(prescription);
    }
    @Transactional
    public void delete(Long id, DoctorProfile doctor) {
        Prescription prescription = prescriptions.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Prescription not found"));
        if (!prescription.getDoctor().equals(doctor)) {
            throw new IllegalStateException("Not your prescription");
        }
        // Supprimer explicitement les intakeEvents si cascade n'est pas utilisé

        intakeEvents.deleteByPrescriptionId(id);
        prescriptions.delete(prescription);
    }
}
