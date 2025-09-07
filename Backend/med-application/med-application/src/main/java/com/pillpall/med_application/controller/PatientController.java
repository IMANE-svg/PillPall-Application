package com.pillpall.med_application.controller;

import com.pillpall.med_application.users.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
public class PatientController {
    private final UserRepository userRepository;
    private final PatientProfileRepository patientRepository;
    private final DoctorProfileRepository doctorRepository;

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

    //La gestion des méedecins du patient : il peut soit ajouter un médecin (trouvé déjà dans la base de données)
    // et supprimer ses médecins

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

    @Data
    public static class UpdateReq {
        private String fullName;
        private String email;
        private String password;
        private LocalDate birthDate;
    }
}