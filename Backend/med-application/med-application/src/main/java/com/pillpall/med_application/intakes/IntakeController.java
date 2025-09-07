package com.pillpall.med_application.intakes;
import jakarta.validation.constraints.NotBlank; import lombok.Data; import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/intakes") @RequiredArgsConstructor
public class IntakeController {

    //Controleur de prise de Médicaments qfin de confirmer que le patient a pris son médicament
    private final IntakeService service;

    @PostMapping("/{id}/confirm")
    public ResponseEntity<?> confirm(@PathVariable Long id, @RequestBody ConfirmReq req) {
        var ev = service.confirm(id, req.getNotes());
        return ResponseEntity.ok(ev.getStatus().name());
    }

    @Data public static class ConfirmReq { @NotBlank private String notes; }
}
