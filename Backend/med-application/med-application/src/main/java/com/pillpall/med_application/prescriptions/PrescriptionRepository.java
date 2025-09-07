package com.pillpall.med_application.prescriptions;

import com.pillpall.med_application.users.PatientProfile;
import org.springframework.data.jpa.repository.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    int countByPatientId(Long patientId);

    int countByDoctorId(Long doctorId);

    // ✅ Utilise createdAt qui existe maintenant
    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.doctor.id = :doctorId AND p.createdAt >= :date")
    int countByDoctorIdAndCreatedAtAfter(@Param("doctorId") Long doctorId, @Param("date") Instant date);

    @Query("SELECT p FROM Prescription p WHERE p.doctor.id = :doctorId AND p.createdAt >= :date ORDER BY p.createdAt DESC")
    List<Prescription> findByDoctorIdAndCreatedAtAfterOrderByCreatedAtDesc(@Param("doctorId") Long doctorId, @Param("date") Instant date);

    @Query("SELECT COUNT(DISTINCT p.patient) FROM Prescription p WHERE p.doctor.id = :doctorId")
    long countDistinctPatientsByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT DISTINCT p.patient FROM Prescription p WHERE p.doctor.id = :doctorId")
    List<PatientProfile> findDistinctPatientsByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Prescription p WHERE p.doctor.id = :doctorId AND p.patient.id = :patientId")
    boolean existsByDoctorIdAndPatientId(@Param("doctorId") Long doctorId, @Param("patientId") Long patientId);

    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.doctor.id = :doctorId AND p.patient.id = :patientId")
    int countByDoctorIdAndPatientId(@Param("doctorId") Long doctorId, @Param("patientId") Long patientId);

    @Query("SELECT p FROM Prescription p WHERE p.patient.id = :patientId ORDER BY p.createdAt DESC")
    List<Prescription> findByPatientIdOrderByCreatedAtDesc(@Param("patientId") Long patientId);

    @Query("SELECT p FROM Prescription p WHERE p.doctor.id = :doctorId ORDER BY p.createdAt DESC")
    List<Prescription> findByDoctorIdOrderByCreatedAtDesc(@Param("doctorId") Long doctorId);

    // Méthodes supplémentaires utiles
    @Query("SELECT p FROM Prescription p WHERE p.patient.id = :patientId AND p.endDate >= CURRENT_DATE")
    List<Prescription> findActiveByPatientId(@Param("patientId") Long patientId);

    @Query("SELECT p FROM Prescription p WHERE p.doctor.id = :doctorId AND p.endDate >= CURRENT_DATE")
    List<Prescription> findActiveByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT p FROM Prescription p WHERE p.patient.id = :patientId AND p.startDate <= :date AND p.endDate >= :date")
    List<Prescription> findByPatientIdAndDate(@Param("patientId") Long patientId, @Param("date") LocalDate date);
}