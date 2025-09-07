package com.pillpall.med_application.ml;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "patient_adherence")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PatientAdherence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "adherence_rate", nullable = false)
    private Double adherenceRate;

    @Column(name = "missed_doses", nullable = false)
    private Integer missedDoses;

    @Column(name = "average_delay")
    private Double averageDelay;

    @Column(name = "total_prescriptions", nullable = false)
    private Integer totalPrescriptions;

    @Column(name = "segment")
    private String segment; // ADHERENT, MODERATE, NON_ADHERENT

    @Column(name = "calculation_date", nullable = false)
    private LocalDate calculationDate;

    @PrePersist
    protected void onCreate() {
        calculationDate = LocalDate.now();
    }
}
