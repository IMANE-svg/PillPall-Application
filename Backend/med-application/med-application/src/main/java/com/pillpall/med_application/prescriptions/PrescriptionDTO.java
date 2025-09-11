package com.pillpall.med_application.prescriptions;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
public class PrescriptionDTO {

    private final Long id;
    private final String medicationName;
    private final String dosage;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final String patientFullName;
    private final String patientEmail;
    private final Instant createdAt;

}