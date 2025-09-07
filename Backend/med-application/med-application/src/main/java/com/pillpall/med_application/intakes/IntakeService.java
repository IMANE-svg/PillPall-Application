package com.pillpall.med_application.intakes;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service @RequiredArgsConstructor
public class IntakeService {
    private final IntakeEventRepository repo;

    @Transactional
    public IntakeEvent confirm(Long intakeId, String notes) {
        var ev = repo.findById(intakeId).orElseThrow();
        ev.setStatus(IntakeEvent.Status.CONFIRMED);
        ev.setConfirmedAt(Instant.now());
        ev.setNotes(notes);
        return ev;
    }
}
