package com.pillpall.med_application.users;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="contacts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Contact {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name="patient_id", nullable=false)
    private PatientProfile patient;
    @Column(nullable=false) private String name;
    private String email;
    private String phone;
}
