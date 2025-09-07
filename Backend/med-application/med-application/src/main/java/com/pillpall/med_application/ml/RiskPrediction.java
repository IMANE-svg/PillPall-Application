package com.pillpall.med_application.ml;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "risk_predictions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RiskPrediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "risk_score", nullable = false)
    private Double riskScore;

    @Column(name = "will_miss", nullable = false)
    private Boolean willMiss;

    @Column(name = "confidence", nullable = false)
    private Double confidence;

    @Column(name = "prediction_date", nullable = false)
    private LocalDate predictionDate;

    @PrePersist
    protected void onCreate() {
        predictionDate = LocalDate.now();
    }
}