package com.pillpall.med_application.notifications;

import com.pillpall.med_application.intakes.IntakeEvent;
import com.pillpall.med_application.intakes.IntakeEventRepository;
import com.pillpall.med_application.users.Contact;
import com.pillpall.med_application.users.ContactRepository;
import com.pillpall.med_application.users.PatientProfile;
import com.pillpall.med_application.users.PatientProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    //L'envoi des notifications et escalade vers les contacts si pas de réponse

    private final FcmGateway fcmGateway;
    private final EmailGateway emailGateway;
    private final SmsGateway smsGateway;
    private final ContactRepository contactRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final IntakeEventRepository intakeEventRepository;

    @Async
    public void sendIntakeReminder(IntakeEvent event) {
        PatientProfile patient = event.getPrescription().getPatient();
        String medicationName = event.getPrescription().getMedicationName();
        String formattedTime = DateTimeFormatter.ofPattern("HH:mm")
                .format(event.getScheduledAt().atZone(java.time.ZoneId.systemDefault()));

        String title = " Rappel de prise";
        String body = String.format("Il est %s - temps de prendre: %s", formattedTime, medicationName);

        // Notification FCM
        if (patient.getUser().getDeviceToken() != null) {
            fcmGateway.sendToToken(patient.getUser().getDeviceToken(), title, body, event.getId().toString());
        }
    }

    @Async
    public void escalateMissedIntake(IntakeEvent event) {
        PatientProfile patient = event.getPrescription().getPatient();
        String medicationName = event.getPrescription().getMedicationName();

        List<Contact> contacts = contactRepository.findByPatientId(patient.getId());

        String subject = " Alerte - Prise de médicament manquée";
        String message = String.format(
                "Le patient %s n'a pas confirmé la prise de %s prévue à %s. Veuillez vérifier.",
                patient.getUser().getFullName(),
                medicationName,
                DateTimeFormatter.ofPattern("HH:mm 'le' dd/MM/yyyy")
                        .format(event.getScheduledAt().atZone(java.time.ZoneId.systemDefault()))
        );

        for (Contact contact : contacts) {
            if (contact.getEmail() != null && !contact.getEmail().isBlank()) {
                emailGateway.send(contact.getEmail(), subject, message);
            }
            if (contact.getPhone() != null && !contact.getPhone().isBlank()) {
                smsGateway.send(contact.getPhone(), message);
            }
        }
    }

    @Async
    @Transactional
    public void sendDailySummary(Long patientId) {
        PatientProfile patient = patientProfileRepository.findById(patientId).orElseThrow();
        Instant todayStart = Instant.now().truncatedTo(java.time.temporal.ChronoUnit.DAYS);
        Instant tomorrowStart = todayStart.plus(Duration.ofDays(1));

        List<IntakeEvent> todayEvents = intakeEventRepository
                .findByPrescriptionPatientIdAndScheduledAtBetween(patientId, todayStart, tomorrowStart);

        long missed = todayEvents.stream().filter(e -> e.getStatus() == IntakeEvent.Status.MISSED).count();
        long taken = todayEvents.stream().filter(e -> e.getStatus() == IntakeEvent.Status.CONFIRMED).count();

        String summary = String.format(
                " Résumé du jour: %d prises effectuées, %d oubliées. Taux d'observance: %.1f%%",
                taken, missed, (taken + missed > 0 ? (double) taken / (taken + missed) * 100 : 100)
        );

        if (patient.getUser().getDeviceToken() != null) {
            fcmGateway.sendToToken(patient.getUser().getDeviceToken(), "📊 Résumé quotidien", summary, "daily_summary");
        }
    }
}
