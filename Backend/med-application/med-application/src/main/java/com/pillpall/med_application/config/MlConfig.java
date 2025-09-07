package com.pillpall.med_application.config;

import com.google.api.client.util.Value;
import com.pillpall.med_application.ml.MlServiceClient;
import org.springframework.context.annotation.*;
import org.springframework.web.client.RestTemplate;

@Configuration
public class MlConfig {
    //La configuration de la machine learning

    @Value("${app.ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    @Bean
    public RestTemplate mlRestTemplate() {
        return new RestTemplate();
    }

    @Bean
    public MlServiceClient mlServiceClient(RestTemplate mlRestTemplate) {
        return new MlServiceClient(mlRestTemplate, mlServiceUrl);
    }
}