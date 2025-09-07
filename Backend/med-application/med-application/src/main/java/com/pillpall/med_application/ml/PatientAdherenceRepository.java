package com.pillpall.med_application.ml;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PatientAdherenceRepository extends JpaRepository<PatientAdherence, Long> {


    @Query("SELECT pa FROM PatientAdherence pa WHERE pa.patientId = :patientId ORDER BY pa.calculationDate DESC LIMIT 1")
    Optional<PatientAdherence> findLatestByPatientId(@Param("patientId") Long patientId);
    @Query("SELECT AVG(pa.adherenceRate) FROM PatientAdherence pa WHERE pa.patientId IN " +
            "(SELECT DISTINCT p.patient.id FROM Prescription p WHERE p.doctor.id = :doctorId)")
    Double calculateAverageAdherenceForDoctorPatients(@Param("doctorId") Long doctorId);



    @Query("SELECT COUNT(pa) FROM PatientAdherence pa WHERE pa.segment = :segment")
    long countBySegment(@Param("segment") String segment);
}

