package com.pillpall.med_application.ml;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

public interface AnomalyDetectionRepository extends JpaRepository<Anomaly, Long> {


    List<Anomaly> findByPatientIdAndResolvedFalse(Long patientId);

    @Query("SELECT a FROM Anomaly a WHERE a.patientId = :patientId AND a.detectedAt >= :sevenDaysAgo")
    List<Anomaly> findRecentAnomaliesByPatientId(@Param("patientId") Long patientId,
                                                 @Param("sevenDaysAgo") Instant sevenDaysAgo);
    // Méthode par défaut pour simplifier l'utilisation
    default List<Anomaly> findRecentAnomaliesByPatientId(Long patientId) {
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        return findRecentAnomaliesByPatientId(patientId, sevenDaysAgo);
    }

}
