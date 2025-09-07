package com.pillpall.med_application.notifications;

import com.twilio.Twilio; import com.twilio.rest.api.v2010.account.Message;
import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

@Component
public class SmsGateway {
    //C'est pour les sms des contacts du patient

    @Value("${app.twilio.accountSid}") String sid;
    @Value("${app.twilio.authToken}") String token;
    @Value("${app.twilio.fromNumber}") String from;

    @PostConstruct public void init(){ Twilio.init(sid, token); }

    public boolean send(String to, String text) {
        try {
            Message.creator(new com.twilio.type.PhoneNumber(to),
                    new com.twilio.type.PhoneNumber(from), text).create();
            return true;
        } catch (Exception e) { return false; }
    }
}
