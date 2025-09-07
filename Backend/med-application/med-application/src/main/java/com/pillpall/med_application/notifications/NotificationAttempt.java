package com.pillpall.med_application.notifications;
import com.pillpall.med_application.intakes.IntakeEvent;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name="notification_attempts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationAttempt {
    //Capter les notifications : est ce que le patient répond aprés la notification ou auùon a envoyé à ses contacts

    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name="intake_event_id", nullable=false)
    private IntakeEvent intakeEvent;
    @Column(nullable=false) private String channel; // FCM, EMAIL, SMS
    @Column(nullable=false) private Instant attemptAt = Instant.now();
    @Column(nullable=false) private boolean success;
    @Column(columnDefinition="text") private String details;
}