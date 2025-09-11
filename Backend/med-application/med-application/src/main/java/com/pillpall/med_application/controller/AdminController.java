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
    private final SpecialtyRepository specialtyRepository;


    //Dashboard pour des statistiques

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalDoctors", doctorRepository.count());
        stats.put("totalPatients", patientProfileRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countByEnabledTrue());
        stats.put("totalSpecialties", specialtyRepository.count());

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



    //Récuperer les patients avec leurs medecins associés
    @GetMapping("/patients")
    public ResponseEntity<?> getAllPatients() {
        List<PatientProfile> patients = patientProfileRepository.findAll();
        List<PatientInfo> patientInfos = patients.stream()
                .map(patient -> new PatientInfo(
                        patient.getId(),
                        patient.getUser().getId(),
                        patient.getUser().getFullName(),
                        patient.getUser().getEmail(),
                        patient.getDoctors().isEmpty()
                                ? "Aucun médecin"
                                : patient.getDoctors().stream()
                                .filter(doctor -> doctor != null && doctor.getUser() != null)
                                .map(doctor -> doctor.getUser().getFullName())
                                .collect(Collectors.joining(", "))
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


//La liste de tous  les utilisateurs de l'application avec leur statut (enable/disablle)
    @GetMapping("/users")
    public List<UserInfo> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserInfo(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRoles().stream().map(Role::getName).collect(Collectors.toList()),
                        user.isEnabled()
                ))
                .collect(Collectors.toList());
    }


    @Data
    public static class UserInfo {
        private final Long id;
        private final String fullName;
        private final String email;
        private final List<String> roles;
        private final boolean enabled;
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
        private final Long userId;
        private final String fullName;
        private final String email;
        private final String doctorNames;

        public PatientInfo(Long id, Long userId, String fullName, String email, String doctorNames) {
            this.id = id;
            this.userId = userId;
            this.fullName = fullName;
            this.email = email;
            this.doctorNames = doctorNames.isEmpty() ? "Aucun médecin" : doctorNames;
        }
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

