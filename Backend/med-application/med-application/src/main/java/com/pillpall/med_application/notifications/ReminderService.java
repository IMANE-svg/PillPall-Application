package com.pillpall.med_application.notifications;

import com.pillpall.med_application.intakes.IntakeEvent;
import com.pillpall.med_application.intakes.IntakeEventRepository;
import com.pillpall.med_application.users.ContactRepository;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;

import java.time.*;

@Service @RequiredArgsConstructor
public class ReminderService {

    // Fixation de temps de renvoi des fcm

    private final IntakeEventRepository intakes;
    private final NotificationAttemptRepository attempts;
    private final FcmGateway fcm; private final EmailGateway email; private final SmsGateway sms;
    private final ContactRepository contacts;

    @Value("${app.notifications.intakeWindowMinutes}") int intakeWindowMinutes;

    @Scheduled(fixedDelay = 60000) // chaque minute
    @SchedulerLock(name="reminderTick", lockAtMostFor = "PT30S", lockAtLeastFor="PT10S")
    @Transactional
    public void processReminders() {
        Instant now = Instant.now();

        var toMiss = intakes.findByStatusAndScheduledAtBefore(IntakeEvent.Status.PENDING, now.minusSeconds(intakeWindowMinutes*60L));
        for (var ev : toMiss) ev.setStatus(IntakeEvent.Status.MISSED);

        var pending = intakes.findByStatusAndScheduledAtBetween(IntakeEvent.Status.PENDING, now.minusSeconds(3600), now);
        for (var ev : pending) {
            var countFcm = attempts.findByIntakeEventId(ev.getId()).stream().filter(a->a.getChannel().equals("FCM")).count();
            long minutesSince = Duration.between(ev.getScheduledAt(), now).toMinutes();

            if ((minutesSince>=0 && countFcm==0) || (minutesSince>=15 && countFcm==1) ||
                    (minutesSince>=30 && countFcm==2) || (minutesSince>=45 && countFcm==3)) {
                boolean ok = sendFcm(ev);
                logAttempt(ev, "FCM", ok, ok ? "sent" : "fail");
            }

            if (minutesSince >= intakeWindowMinutes && countFcm >= 4) {
                escalate(ev);
            }
        }
    }

    private boolean sendFcm(IntakeEvent ev) {
        var patient = ev.getPrescription().getPatient().getUser();
        if (patient.getDeviceToken()==null || patient.getDeviceToken().isBlank()) return false;
        String title = "Rappel de prise";
        String body = "Il est temps de prendre: " + ev.getPrescription().getMedicationName();
        return fcm.sendToToken(patient.getDeviceToken(), title, body, String.valueOf(ev.getId()));
    }

    private void escalate(IntakeEvent ev) {
        var patient = ev.getPrescription().getPatient();
        for (var c : contacts.findByPatientId(patient.getId())) {
            if (c.getEmail()!=null && !c.getEmail().isBlank()) {
                boolean ok = email.send(c.getEmail(), "Alerte patient",
                        "Aucune confirmation après 60 minutes pour: "+ev.getPrescription().getMedicationName());
                logAttempt(ev, "EMAIL", ok, ok ? "sent" : "fail");
            }
            if (c.getPhone()!=null && !c.getPhone().isBlank()) {
                boolean ok = sms.send(c.getPhone(), "Alerte: pas de confirmation de prise pour "+ev.getPrescription().getMedicationName());
                logAttempt(ev, "SMS", ok, ok ? "sent" : "fail");
            }
        }
    }

    private void logAttempt(IntakeEvent ev, String channel, boolean success, String details) {
        attempts.save(NotificationAttempt.builder()
                .intakeEvent(ev).channel(channel).success(success).details(details).build());
    }
}
