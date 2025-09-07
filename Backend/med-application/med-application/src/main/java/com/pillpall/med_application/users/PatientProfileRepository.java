package com.pillpall.med_application.users;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {
    Optional<PatientProfile> findByUserId(Long userId);
    @Query("SELECT p FROM PatientProfile p JOIN p.doctors d WHERE d.id = :doctorId")
    List<PatientProfile> findByDoctorId(@Param("doctorId") Long doctorId);
}
