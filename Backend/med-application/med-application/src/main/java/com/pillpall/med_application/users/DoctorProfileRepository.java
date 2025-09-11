package com.pillpall.med_application.users;

import org.springframework.data.jpa.repository.*;

import java.util.List;
import java.util.Optional;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {
    @Query("SELECT d FROM DoctorProfile d WHERE d.user.id = :userId")
    Optional<DoctorProfile> findByUserId(Long userId);
}
