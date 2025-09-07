package com.pillpall.med_application.auth;

import com.pillpall.med_application.security.JwtService;
import com.pillpall.med_application.users.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {


    private final UserRepository users;
    private final RoleRepository roles;
    private final PatientProfileRepository patients;
    private final DoctorProfileRepository doctors;
    private final SpecialtyRepository specialtyRepository;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    //Endpoint pour l'inscription

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> register(@RequestBody RegisterReq req) {
        if (users.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }
        var role = roles.findByName(req.getRole()).orElseThrow(() -> new IllegalArgumentException("Role not found"));
        var user = User.builder()
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .timezone(req.getTimezone())
                .roles(Set.of(role))
                .enabled(true)
                .createdAt(Instant.now())
                .build();
        users.save(user);

        //Si le role de l'utilisateur est patient alors il peut choisir un ou plusieurs  medecins

        if ("ROLE_PATIENT".equals(role.getName())) {
            var patient = PatientProfile.builder()
                    .user(user)
                    .build();
            if (req.getDoctorIds() != null && !req.getDoctorIds().isEmpty()) {
                var selectedDoctors = doctors.findAllById(req.getDoctorIds());
                patient.setDoctors(new HashSet<>(selectedDoctors));
            }
            patients.save(patient);
        }
        //Sinon si l'utilisateur est un médecin il choisit sa spécialité
        else if ("ROLE_DOCTOR".equals(role.getName())) {
            if (req.getSpecialtyId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "SpecialtyId is required for doctors"));
            }
            var specialty = specialtyRepository.findById(req.getSpecialtyId())
                    .orElseThrow(() -> new IllegalArgumentException("Specialty not found"));
            doctors.save(DoctorProfile.builder()
                    .user(user)
                    .specialty(specialty)
                    .build());
        }
        var token = jwt.generate(user.getEmail(), Map.of("roles", user.getRoles().stream().map(Role::getName).toArray()));
        return ResponseEntity.ok(Map.of("token", token));
    }

    //Endpoint pour la connexion

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req) {
        var user = users.findByEmail(req.getEmail()).orElse(null);
        System.out.println("User found: " + (user != null));
        System.out.println("Password matches: " + (user != null && encoder.matches(req.getPassword(), user.getPassword())));
        if (user == null || !encoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
        var token = jwt.generate(user.getEmail(), Map.of("roles", user.getRoles().stream().map(Role::getName).toArray()));
        return ResponseEntity.ok(Map.of("token", token));
    }

    @Data
    public static class RegisterReq {
        @Email @NotBlank private String email;
        @NotBlank private String password;
        @NotBlank private String fullName;
        @NotBlank private String role; // ROLE_PATIENT or ROLE_DOCTOR
        private String timezone = "Africa/Casablanca";
        private Long specialtyId; // Changé de Specialty à Long
        private List<Long> doctorIds; // Pour les patients
    }

    @Data
    public static class LoginReq {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }
}