package com.pillpall.med_application.intakes;

import org.springframework.data.jpa.repository.*;
import java.time.Instant;
import java.util.*;

public interface IntakeEventRepository extends JpaRepository<IntakeEvent, Long> {
    List<IntakeEvent> findByStatusAndScheduledAtBetween(IntakeEvent.Status status, Instant from, Instant to);

    List<IntakeEvent> findByStatusAndScheduledAtBefore(IntakeEvent.Status status, Instant before);

    List<IntakeEvent> findByPrescriptionPatientIdAndScheduledAtAfter(Long id, Instant startDate);

    List<IntakeEvent> findByPrescriptionPatientIdAndScheduledAtBetweenAndStatus(Long patientId, Instant now, Instant next24Hours, IntakeEvent.Status status);

    List<IntakeEvent> findByPrescriptionPatientId(Long patientId);

    List<IntakeEvent> findByPrescriptionPatientIdAndStatus(Long patientId, IntakeEvent.Status status);

    List<IntakeEvent> findByPrescriptionPatientIdAndScheduledAtBetween(Long patientId, Instant todayStart, Instant tomorrowStart);
}
