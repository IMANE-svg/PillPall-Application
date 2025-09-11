package com.pillpall.med_application.prescriptions;
import jakarta.persistence.*; import lombok.*;

@Entity @Table(name="dose_times")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DoseTime {

    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name="prescription_id", nullable=false)
    private Prescription prescription;
    @Column(nullable=false) private int hour;
    @Column(nullable=false) private int minute;

}