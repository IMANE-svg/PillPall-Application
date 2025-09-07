package com.pillpall.med_application.config;

import com.pillpall.med_application.users.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class AdminInitializer {

    // Ce controlleur à pour but d'initialiser l'administrateur du système , changer ses données comme vous voulez
    //L'admin se crée grace à ce controlleur et par consequence il ne s'inscrit pas juste se connecte
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DoctorProfileRepository doctorRepository;
    private final PatientProfileRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    @Transactional
    public void initAdminAndTestData() {
        initRoles();
        initAdminUser();

        System.out.println(" Initial data created successfully!");
    }

    private void initRoles() {
        createRoleIfNotExists("ROLE_ADMIN");
        createRoleIfNotExists("ROLE_DOCTOR");
        createRoleIfNotExists("ROLE_PATIENT");
    }

    private void createRoleIfNotExists(String roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            roleRepository.save(new Role(null, roleName));
            System.out.println(" Role created: " + roleName);
        }
    }

    private void initAdminUser() {
        if (userRepository.findByEmail("admin@pillpall.com").isEmpty()) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseThrow();

            User admin = User.builder()
                    .email("admin@pillpall.com")
                    .password(passwordEncoder.encode("admin2024"))
                    .fullName("System Administrator")
                    .timezone("Africa/Casablanca")
                    .enabled(true)
                    .createdAt(Instant.now())
                    .roles(Set.of(adminRole))
                    .build();

            userRepository.save(admin);
            System.out.println(" Admin user created: admin@pillpall.com / admin2024");
        }
    }






}
