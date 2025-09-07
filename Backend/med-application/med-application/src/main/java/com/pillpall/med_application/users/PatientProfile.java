package com.pillpall.med_application.users;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity @Table(name="patient_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PatientProfile {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @OneToOne @JoinColumn(name="user_id", nullable=false, unique=true)
    private User user;
    private LocalDate birthDate;

    @ManyToMany
    @JoinTable(name = "patient_doctors",
            joinColumns = @JoinColumn(name = "patient_id"),
            inverseJoinColumns = @JoinColumn(name = "doctor_id"))
    private Set<DoctorProfile> doctors = new HashSet<>();
}