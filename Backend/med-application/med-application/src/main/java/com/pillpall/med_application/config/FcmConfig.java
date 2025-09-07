package com.pillpall.med_application.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;


import java.io.InputStream;

@Configuration
public class FcmConfig {

    //Configuration de Firbase Cloud Messaging

    @Value("${app.fcm.credentialsPath}")
    private String credentialsPath;

    @PostConstruct
    public void init() throws Exception {
        if (FirebaseApp.getApps().isEmpty()) {
            Resource resource = new ClassPathResource(credentialsPath.replace("classpath:", ""));

            try (InputStream in = resource.getInputStream()) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(in))
                        .build();
                FirebaseApp.initializeApp(options);
                System.out.println(" Firebase initialized successfully from: " + credentialsPath);
            }
        }
    }
}