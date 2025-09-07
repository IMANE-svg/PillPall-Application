package com.pillpall.med_application.ml;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "anomalies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Anomaly {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "type", nullable = false)
    private String type; // SUDDEN_STOP, POTENTIAL_OVERDOSE, BEHAVIORAL_CHANGE

    @Column(name = "severity", nullable = false)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "detected_at", nullable = false)
    private Instant detectedAt;

    @Column(name = "resolved")
    private Boolean resolved = false;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @PrePersist
    protected void onCreate() {
        detectedAt = Instant.now();
    }
}
