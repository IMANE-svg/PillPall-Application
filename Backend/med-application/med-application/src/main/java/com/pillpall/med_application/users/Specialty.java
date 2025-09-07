package com.pillpall.med_application.users;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="specialties")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Specialty {

    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, unique=true) private String name;
}