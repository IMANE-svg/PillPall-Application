package com.pillpall.med_application.prescriptions;

import com.pillpall.med_application.users.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Entity @Table(name="prescriptions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Prescription {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name="patient_id", nullable=false) private PatientProfile patient;
    @ManyToOne @JoinColumn(name="doctor_id", nullable=false) private DoctorProfile doctor;
    @Column(nullable=false) private String medicationName;
    private String dosage;
    @Column(nullable=false) private LocalDate startDate;
    @Column(nullable=false) private LocalDate endDate;
    @OneToMany(mappedBy="prescription", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<DoseTime> doseTimes;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
