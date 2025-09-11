package com.pillpall.med_application.controller;

import com.pillpall.med_application.users.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
public class PatientController {
    private final UserRepository userRepository;
    private final PatientProfileRepository patientRepository;
    private final DoctorProfileRepository doctorRepository;

    // Mise à jour du deviceToken pour FCM
    @PutMapping("/device-token")
    public ResponseEntity<?> updateDeviceToken(@AuthenticationPrincipal String email, @RequestBody UserController.DeviceTokenReq req) {
        var user = userRepository.findByEmail(email).orElseThrow();
        user.setDeviceToken(req.getDeviceToken());
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    //Le profil du patient :où il peut modifier ses informations personnels

    @PutMapping("/me")
    public ResponseEntity<?> updatePersonalInfo(@AuthenticationPrincipal String email, @RequestBody UpdateReq req) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var patient = patientRepository.findByUserId(user.getId()).orElseThrow();
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        if (req.getPassword() != null) user.setPassword(req.getPassword());
        patient.setBirthDate(req.getBirthDate());
        patientRepository.save(patient);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/me")
    public ResponseEntity<?> getPersonalInfo(@AuthenticationPrincipal String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var patient = patientRepository.findByUserId(user.getId()).orElseThrow();
        Map<String, Object> info = new HashMap<>();
        info.put("fullName", user.getFullName());
        info.put("email", user.getEmail());
        info.put("birthDate", patient.getBirthDate());
        return ResponseEntity.ok(info);
    }

    //La gestion des médecins du patient : il peut  ajouter un médecin (trouvé déjà dans la base de données)

    @PostMapping("/doctors/{doctorId}")
    public ResponseEntity<?> addDoctor(@AuthenticationPrincipal String email, @PathVariable Long doctorId) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var patient = patientRepository.findByUserId(user.getId()).orElseThrow();
        var doctor = doctorRepository.findById(doctorId).orElseThrow();
        patient.getDoctors().add(doctor);
        patientRepository.save(patient);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/doctors/{doctorId}")
    public ResponseEntity<?> removeDoctor(@AuthenticationPrincipal String email, @PathVariable Long doctorId) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var patient = patientRepository.findByUserId(user.getId()).orElseThrow();
        var doctor = doctorRepository.findById(doctorId).orElseThrow();
        patient.getDoctors().remove(doctor);
        patientRepository.save(patient);
        return ResponseEntity.ok().build();
    }

    //Lister les medecins du patient
    @GetMapping("/doctors")
    public ResponseEntity<?> getDoctors(@AuthenticationPrincipal String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        var patient = patientRepository.findByUserId(user.getId()).orElseThrow();
        List<DoctorInfo> doctorInfos = patient.getDoctors().stream()
                .map(doctor -> new DoctorInfo(
                        doctor.getId(),
                        doctor.getUser().getFullName(),
                        doctor.getUser().getEmail(),
                        doctor.getSpecialty()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(doctorInfos);
    }
    @Data
    public static class UpdateReq {
        private String fullName;
        private String email;
        private String password;
        private LocalDate birthDate;
    }
    @Data
    public static class DoctorInfo {
        private final Long id;
        private final String fullName;
        private final String email;
        private final Specialty specialty;
    }

    @Data
    public static class DeviceTokenReq {
        private String deviceToken;
    }
}
