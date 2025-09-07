package com.pillpall.med_application.config;


import com.pillpall.med_application.users.Specialty;
import com.pillpall.med_application.users.SpecialtyRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class SpecialiteDataLoader {

    //Pour initialiser quelques spécialités

    private final SpecialtyRepository specialiteRepository;

    @PostConstruct
    public void load() {
        if (specialiteRepository.count() == 0) {
            specialiteRepository.saveAll(Arrays.asList(
                    new Specialty(null, "Cardiologie"),
                    new Specialty(null, "Dermatologie"),
                    new Specialty(null, "Pédiatrie"),
                    new Specialty(null, "Neurologie")
            ));
        }
    }
}
