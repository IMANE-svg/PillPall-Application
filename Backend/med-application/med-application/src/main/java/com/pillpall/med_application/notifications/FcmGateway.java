package com.pillpall.med_application.notifications;

import com.google.firebase.messaging.*;
import org.springframework.stereotype.Component;

@Component
public class FcmGateway {
    public boolean sendToToken(String token, String title, String body, String intakeId) {
        try {
            var message = Message.builder()
                    .setToken(token)
                    .putData("intakeId", intakeId)
                    .setNotification(Notification.builder().setTitle(title).setBody(body).build())
                    .build();
            FirebaseMessaging.getInstance().send(message);
            return true;
        } catch (Exception e) { return false; }
    }
}
