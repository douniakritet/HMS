package com.medical.patient.api.dto;

import com.medical.patient.domain.Sexe;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record PatientRequest(
        @NotBlank String nom,
        @NotBlank String prenom,
        LocalDate dateNaissance,
        @Email String email,
        String numeroSecuriteSociale,
        String adresse,
        String telephone,
        Sexe sexe
) {}
