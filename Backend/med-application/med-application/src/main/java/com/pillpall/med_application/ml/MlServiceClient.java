package com.pillpall.med_application.ml;

import com.pillpall.med_application.intakes.IntakeEvent;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.*;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component

public class MlServiceClient {
    private final RestTemplate restTemplate;
    private final String baseUrl;

    public MlServiceClient(RestTemplate restTemplate, String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    public List<String> clusterPatients(List<PatientAdherence> patientData) {
        String url = baseUrl + "/cluster-patients";

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
        return (List<String>) response.getBody().get("clusters");
    }

    public Map<String, Object> predictRisk(Long patientId, List<IntakeEvent> historicalEvents) {
        String url = baseUrl + "/predict-risk";

        List<Map<String, Object>> eventsData = historicalEvents.stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("event_id", e.getId());
                    map.put("patient_id", patientId);
                    map.put("medication", e.getPrescription().getMedicationName());
                    map.put("scheduled_time", e.getScheduledAt());
                    map.put("actual_time", e.getConfirmedAt());
                    map.put("status", e.getStatus().name());
                    map.put("delay_minutes", calculateDelayMinutes(e));
                    return map;
                })
                .collect(Collectors.toList());

        Map<String, Object> request = new HashMap<>();
        request.put("patient_id", patientId);
        request.put("historical_events", eventsData);
        request.put("current_time", Instant.now());

        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
        return response.getBody();
    }

    public Map<String, Object> detectAnomalies(Long patientId, List<IntakeEvent> events) {
        String url = baseUrl + "/detect-anomalies";

        List<Map<String, Object>> eventsData = events.stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("event_id", e.getId());
                    map.put("patient_id", patientId);
                    map.put("medication", e.getPrescription().getMedicationName());
                    map.put("scheduled_time", e.getScheduledAt());
                    map.put("actual_time", e.getConfirmedAt());
                    map.put("status", e.getStatus().name());
                    map.put("delay_minutes", calculateDelayMinutes(e));
                    return map;
                })
                .collect(Collectors.toList());

        ResponseEntity<Map> response = restTemplate.postForEntity(url, eventsData, Map.class);
        return response.getBody();
    }

    private Double calculateDelayMinutes(IntakeEvent event) {
        if (event.getStatus() != IntakeEvent.Status.CONFIRMED || event.getConfirmedAt() == null) {
            return null;
        }
        return (double) Duration.between(event.getScheduledAt(), event.getConfirmedAt()).toMinutes();
    }
}