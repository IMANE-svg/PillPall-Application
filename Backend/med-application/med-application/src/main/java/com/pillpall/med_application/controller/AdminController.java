package com.pillpall.med_application.controller;

import com.pillpall.med_application.users.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotBlank;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {
    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final RoleRepository roleRepository;


    //Dashboard pour des statistiques

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalDoctors", doctorRepository.count());
        stats.put("totalPatients", patientProfileRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countByEnabledTrue());

        return ResponseEntity.ok(stats);
    }

    //EndpointS pour gérer les médecins

    //Consulter la liste des médecins

    @GetMapping("/doctors")
    public ResponseEntity<?> getAllDoctors() {
        List<DoctorProfile> doctors = doctorRepository.findAll();

        List<DoctorInfo> doctorInfos = doctors.stream()
                .map(doctor -> new DoctorInfo(
                        doctor.getId(),
                        doctor.getUser().getFullName(),
                        doctor.getUser().getEmail(),
                        doctor.getSpecialty(),
                        doctor.getUser().isEnabled()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(doctorInfos);
    }

    // La modification des médecins

    @PutMapping("/doctors/{id}")
    public ResponseEntity<?> updateDoctor(@PathVariable Long id, @RequestBody DoctorUpdateReq req) {
        var doctor = doctorRepository.findById(id).orElseThrow();
        doctor.getUser().setFullName(req.getFullName());
        doctor.getUser().setEmail(req.getEmail());
        doctor.setSpecialty(req.getSpecialty());  // Maintenant Specialty object, assume req a specialtyId ou name – adapte
        doctorRepository.save(doctor);
        return ResponseEntity.ok(Map.of("message", "Doctor updated"));
    }

    //La gestion des patients

    @GetMapping("/patients")
    public ResponseEntity<?> getAllPatients() {
        List<PatientProfile> patients = patientProfileRepository.findAll();

        List<PatientInfo> patientInfos = patients.stream()
                .map(patient -> new PatientInfo(
                        patient.getId(),
                        patient.getUser().getFullName(),
                        patient.getUser().getEmail(),
                        patient.getBirthDate(),
                        patient.getUser().isEnabled()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(patientInfos);
    }

    //Récuperer les patients selon les médecins
    @GetMapping("/doctors/{doctorId}/patients")
    public ResponseEntity<?> getPatientsByDoctor(@PathVariable Long doctorId) {
        var patients = patientProfileRepository.findByDoctorId(doctorId);
        List<PatientInfo> patientInfos = patients.stream()
                .map(patient -> new PatientInfo(
                        patient.getId(),
                        patient.getUser().getFullName(),
                        patient.getUser().getEmail(),
                        patient.getBirthDate(),
                        patient.getUser().isEnabled()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(patientInfos);
    }

    //Modification des patients
    @PutMapping("/patients/{id}")
    public ResponseEntity<?> updatePatient(@PathVariable Long id, @RequestBody PatientUpdateReq req) {
        var patient = patientProfileRepository.findById(id).orElseThrow();
        patient.getUser().setFullName(req.getFullName());
        patient.getUser().setEmail(req.getEmail());
        patient.setBirthDate(req.getBirthDate());
        patientProfileRepository.save(patient);
        return ResponseEntity.ok(Map.of("message", "Patient updated"));
    }

    //Gestion des droits (Activer ou désactiver les roles des utilisateurs)
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId, @RequestBody StatusUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setEnabled(request.isEnabled());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User status updated successfully"));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        userRepository.deleteById(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }



    // DTO Classes
    @Data
    public static class DoctorInfo {
        private final Long id;
        private final String fullName;
        private final String email;
        private final Specialty specialty;
        private final boolean enabled;
    }

    @Data
    public static class PatientInfo {
        private final Long id;
        private final String fullName;
        private final String email;
        private final java.time.LocalDate birthDate;
        private final boolean enabled;
    }

    @Data
    public static class StatusUpdateRequest {
        private boolean enabled;
    }
    @Data
    public static class DoctorUpdateReq {
        private String fullName;
        private String email;
        private Specialty specialty;  // Ou Long specialtyId si besoin
    }

    @Data
    public static class PatientUpdateReq {
        private String fullName;
        private String email;
        private java.time.LocalDate birthDate;
    }
}