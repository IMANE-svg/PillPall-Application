package com.pillpall.med_application.users;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users/me/contacts")
@RequiredArgsConstructor
public class ContactController {
    private final UserRepository users;
    private final PatientProfileRepository patients;
    private final ContactRepository contacts;

    @GetMapping
    public List<Contact> list(@AuthenticationPrincipal String email) {
        var user = users.findByEmail(email).orElseThrow();
        var p = patients.findByUserId(user.getId()).orElseThrow();
        return contacts.findByPatientId(p.getId());
    }

    @PostMapping
    public ResponseEntity<?> add(@AuthenticationPrincipal String email, @RequestBody ContactReq req) {
        var user = users.findByEmail(email).orElseThrow();
        var p = patients.findByUserId(user.getId()).orElseThrow();
        var c = Contact.builder().patient(p).name(req.getName()).email(req.getEmail()).phone(req.getPhone()).build();
        contacts.save(c);
        return ResponseEntity.ok(c.getId());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@AuthenticationPrincipal String email, @PathVariable Long id, @RequestBody ContactReq req) {
        var user = users.findByEmail(email).orElseThrow();
        var p = patients.findByUserId(user.getId()).orElseThrow();
        var contact = contacts.findById(id).orElseThrow();
        if (!contact.getPatient().equals(p)) {
            return ResponseEntity.status(403).body("Not your contact");
        }
        contact.setName(req.getName());
        contact.setEmail(req.getEmail());
        contact.setPhone(req.getPhone());
        contacts.save(contact);
        return ResponseEntity.ok(contact.getId());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal String email, @PathVariable Long id) {
        var user = users.findByEmail(email).orElseThrow();
        var p = patients.findByUserId(user.getId()).orElseThrow();
        var contact = contacts.findById(id).orElseThrow();
        if (!contact.getPatient().equals(p)) {
            return ResponseEntity.status(403).body("Not your contact");
        }
        contacts.delete(contact);
        return ResponseEntity.ok().build();
    }

    @Data public static class ContactReq { @NotBlank private String name; private String email; private String phone; }
}