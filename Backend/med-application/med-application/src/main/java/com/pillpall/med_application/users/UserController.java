package com.pillpall.med_application.users;
import jakarta.validation.constraints.NotBlank; import lombok.Data; import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity; import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/users/me") @RequiredArgsConstructor
public class UserController {
    private final UserRepository users;

    @PostMapping("/device-token")
    public ResponseEntity<?> saveDeviceToken(@AuthenticationPrincipal String email, @RequestBody DeviceTokenReq req) {
        var u = users.findByEmail(email).orElseThrow();
        u.setDeviceToken(req.getDeviceToken());
        users.save(u);
        return ResponseEntity.ok().build();
    }

    @Data public static class DeviceTokenReq { @NotBlank private String deviceToken; }
}
