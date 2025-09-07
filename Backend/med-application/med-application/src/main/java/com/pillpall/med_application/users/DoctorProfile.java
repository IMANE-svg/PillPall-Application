package com.pillpall.med_application.users;

import jakarta.persistence.*; import lombok.*;

@Entity @Table(name="doctor_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DoctorProfile {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @OneToOne @JoinColumn(name="user_id", nullable=false, unique=true)
    private User user;
    @ManyToOne @JoinColumn(name="specialty_id")
    private Specialty specialty;

}