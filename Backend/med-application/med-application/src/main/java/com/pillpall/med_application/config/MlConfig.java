package com.pillpall.med_application.config;


import com.pillpall.med_application.ml.MlServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.web.client.RestTemplate;

@Configuration
public class MlConfig {
    private static final Logger log = LoggerFactory.getLogger(MlConfig.class);
    //La configuration de la machine learning

    @Value("${ml.service.base-url:http://localhost:8000}")
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