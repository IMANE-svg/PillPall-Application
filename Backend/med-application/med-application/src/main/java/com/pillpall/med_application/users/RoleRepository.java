package com.pillpall.med_application.users;

import org.springframework.data.jpa.repository.*; import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
