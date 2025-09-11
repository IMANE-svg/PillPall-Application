package com.pillpall.med_application.ml;

import com.pillpall.med_application.intakes.IntakeEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class MlServiceClient {
    private static final Logger log = LoggerFactory.getLogger(MlServiceClient.class);
    private final RestTemplate restTemplate;
    private final String baseUrl;

    public MlServiceClient(RestTemplate restTemplate, String baseUrl) {
        this.restTemplate = restTemplate;
        // Valider et normaliser baseUrl
        String validatedUrl;
        try {
            new URI(baseUrl).toURL(); // Vérifier si l'URL est valide
            validatedUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        } catch (Exception e) {
            log.error("URL de base invalide fournie : {}. Utilisation de la valeur par défaut : http://localhost:8000", baseUrl, e);
            validatedUrl = "http://localhost:8000";
        }
        this.baseUrl = validatedUrl;
        log.info("MlServiceClient initialisé avec baseUrl : {}", this.baseUrl);
    }


//segmenter les profils d’adhérence
    public List<String> clusterPatients(List<PatientAdherence> patientData) {
        String url = baseUrl + "/cluster-patients";
        log.info("Calling ML service at {} with {} patient records", url, patientData.size());
        try {
            List<Map<String, Object>> requestData = patientData.stream()
                    .map(p -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("patient_id", p.getPatientId());
                        map.put("adherence_rate", p.getAdherenceRate());
                        map.put("missed_doses", p.getMissedDoses());
                        map.put("average_delay", p.getAverageDelay());
                        map.put("total_prescriptions", p.getTotalPrescriptions());
                        return map;
                    })
                    .collect(Collectors.toList());

            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestData, Map.class);
            log.debug("Received response from ML service: {}", response.getBody());
            return (List<String>) response.getBody().get("clusters");
        } catch (IllegalArgumentException e) {
            log.error("Invalid URI for cluster-patients: {}", url, e);
            throw new RuntimeException("Invalid ML service URI: " + url, e);
        } catch (HttpClientErrorException e) {
            log.error("ML service error for cluster-patients. Status: {}, Response: {}",
                    e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new RuntimeException("Failed to cluster patients: " + e.getMessage(), e);
        } catch (ResourceAccessException e) {
            log.error("Failed to connect to ML service at {}: {}", url, e.getMessage(), e);
            throw new RuntimeException("ML service unavailable", e);
        } catch (Exception e) {
            log.error("Unexpected error calling ML service for cluster-patients: {}", e.getMessage(), e);
            throw new RuntimeException("Unexpected error in ML clustering", e);
        }
    }


    //Prediction des risques d'oublie

    public Map<String, Object> predictRisk(Long patientId, List<IntakeEvent> historicalEvents) {
        String url = baseUrl + "/predict-risk";
        log.info("Calling ML service at {} for patientId: {}", url, patientId);
        try {
            List<Map<String, Object>> eventsData = historicalEvents.stream()
                    .map(e -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("event_id", e.getId());
                        map.put("patient_id", patientId);
                        map.put("medication", e.getPrescription().getMedicationName());
                        map.put("scheduled_time", e.getScheduledAt().toString());
                        map.put("actual_time", e.getConfirmedAt() != null ? e.getConfirmedAt().toString() : null);
                        map.put("status", e.getStatus().name());
                        map.put("delay_minutes", calculateDelayMinutes(e));
                        return map;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> request = new HashMap<>();
            request.put("patient_id", patientId);
            request.put("historical_events", eventsData);
            request.put("current_time", Instant.now().toString());

            log.debug("Sending request to ML service: {}", request);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            log.debug("Received response from ML service: {}", response.getBody());
            return response.getBody();
        } catch (IllegalArgumentException e) {
            log.error("Invalid URI for predict-risk: {}", url, e);
            return Map.of("risk_score", 0.5, "will_miss", false, "confidence", 0.0);
        } catch (HttpClientErrorException e) {
            log.error("ML service error for predict-risk. Status: {}, Response: {}",
                    e.getStatusCode(), e.getResponseBodyAsString(), e);
            return Map.of("risk_score", 0.5, "will_miss", false, "confidence", 0.0);
        } catch (ResourceAccessException e) {
            log.error("Failed to connect to ML service at {}: {}", url, e.getMessage(), e);
            return Map.of("risk_score", 0.5, "will_miss", false, "confidence", 0.0);
        } catch (Exception e) {
            log.error("Unexpected error calling ML service for predict-risk: {}", e.getMessage(), e);
            return Map.of("risk_score", 0.5, "will_miss", false, "confidence", 0.0);
        }
    }

    //Detection des anomalies

    public Map<String, Object> detectAnomalies(Long patientId, List<IntakeEvent> events) {
        String url = baseUrl + "/detect-anomalies";
        log.info("Calling ML service at {} for anomaly detection for patientId: {}", url, patientId);
        try {
            List<Map<String, Object>> eventsData = events.stream()
                    .map(e -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("event_id", e.getId());
                        map.put("patient_id", patientId);
                        map.put("medication", e.getPrescription().getMedicationName());
                        map.put("scheduled_time", e.getScheduledAt().toString());
                        map.put("actual_time", e.getConfirmedAt() != null ? e.getConfirmedAt().toString() : null);
                        map.put("status", e.getStatus().name());
                        map.put("delay_minutes", calculateDelayMinutes(e));
                        return map;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> request = new HashMap<>();
            request.put("patient_events", eventsData);

            log.debug("Sending anomaly detection request: {}", request);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            log.debug("Received response from ML service: {}", response.getBody());
            return response.getBody();
        } catch (IllegalArgumentException e) {
            log.error("Invalid URI for detect-anomalies: {}", url, e);
            return Map.of("has_anomaly", false);
        } catch (HttpClientErrorException e) {
            log.error("ML service error for detect-anomalies. Status: {}, Response: {}",
                    e.getStatusCode(), e.getResponseBodyAsString(), e);
            return Map.of("has_anomaly", false);
        } catch (ResourceAccessException e) {
            log.error("Failed to connect to ML service at {}: {}", url, e.getMessage(), e);
            return Map.of("has_anomaly", false);
        } catch (Exception e) {
            log.error("Unexpected error calling ML service for detect-anomalies: {}", e.getMessage(), e);
            return Map.of("has_anomaly", false);
        }
    }

    private Double calculateDelayMinutes(IntakeEvent event) {
        if (event.getStatus() != IntakeEvent.Status.CONFIRMED || event.getConfirmedAt() == null) {
            return null;
        }
        return (double) Duration.between(event.getScheduledAt(), event.getConfirmedAt()).toMinutes();
    }
}