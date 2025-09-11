package com.pillpall.med_application.controller;

import com.pillpall.med_application.users.Specialty;
import com.pillpall.med_application.users.SpecialtyRepository;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/specialties")
@RequiredArgsConstructor
public class SpecialtyController {
    private final SpecialtyRepository repository;

    // Endpoint non sécurisé pour l'inscription
    @GetMapping("/public")
    public List<Specialty> listPublic() {
        return repository.findAll();
    }

    //Les endpoints pour la gestion des spécialités par l' administrateur : CRUD

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<Specialty> list() {
        return repository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> add(@RequestBody SpecialtyReq req) {
        var specialty = Specialty.builder().name(req.getName()).build();
        repository.save(specialty);
        return ResponseEntity.ok(specialty.getId());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody SpecialtyReq req) {
        var specialty = repository.findById(id).orElseThrow();
        specialty.setName(req.getName());
        repository.save(specialty);
        return ResponseEntity.ok(specialty.getId());
    }



    @Data
    public static class SpecialtyReq {
        @NotBlank private String name;
    }
}