package com.pillpall.med_application.users;

import org.springframework.data.jpa.repository.*; import java.util.List;

public interface ContactRepository extends JpaRepository<Contact, Long> {
    List<Contact> findByPatientId(Long patientId);
}