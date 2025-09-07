package com.pillpall.med_application.prescriptions;

import com.pillpall.med_application.intakes.IntakeEvent;
import com.pillpall.med_application.intakes.IntakeEventRepository;
import com.pillpall.med_application.users.PatientProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
import java.time.*;

@Service @RequiredArgsConstructor
public class PrescriptionService {
    private final PrescriptionRepository prescriptions; private final IntakeEventRepository intakes;

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
}
