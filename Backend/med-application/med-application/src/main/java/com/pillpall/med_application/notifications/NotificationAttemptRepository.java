package com.pillpall.med_application.notifications;

import org.springframework.data.jpa.repository.*; import java.util.List;

public interface NotificationAttemptRepository extends JpaRepository<NotificationAttempt, Long> {
    List<NotificationAttempt> findByIntakeEventId(Long intakeEventId);
}