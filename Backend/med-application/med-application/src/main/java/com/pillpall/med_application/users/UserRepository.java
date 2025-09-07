package com.pillpall.med_application.users;

import org.springframework.data.jpa.repository.*; import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Object countByEnabledTrue();
}
