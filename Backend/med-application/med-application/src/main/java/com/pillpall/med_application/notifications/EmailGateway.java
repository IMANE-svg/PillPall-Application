package com.pillpall.med_application.notifications;

import org.springframework.mail.SimpleMailMessage; import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component; import lombok.RequiredArgsConstructor;

@Component @RequiredArgsConstructor
public class EmailGateway {

    //Pour les émails des contacts du patient
    private final JavaMailSender mail;

    public boolean send(String to, String subject, String text) {
        try {
            var m = new SimpleMailMessage();
            m.setTo(to); m.setSubject(subject); m.setText(text);
            mail.send(m); return true;
        } catch (Exception e) { return false; }
    }
}
