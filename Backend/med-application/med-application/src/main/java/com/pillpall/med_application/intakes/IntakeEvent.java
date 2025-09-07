package com.pillpall.med_application.intakes;
import com.pillpall.med_application.prescriptions.Prescription;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name="intake_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IntakeEvent {

    //La prise a trois état et le système marque l'heure de prise
    public enum Status { PENDING, CONFIRMED, MISSED }

    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name="prescription_id", nullable=false)
    private Prescription prescription;

    @Column(nullable=false) private Instant scheduledAt;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private Status status = Status.PENDING;
    private Instant confirmedAt;
    @Column(columnDefinition="text") private String notes;
}