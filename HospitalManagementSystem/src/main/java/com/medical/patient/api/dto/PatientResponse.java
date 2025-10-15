package com.medical.patient.api.dto;

import com.medical.patient.domain.Sexe;
import java.time.LocalDate;

public record PatientResponse(
        Long id, String nom, String prenom, LocalDate dateNaissance,
        String email, String numeroSecuriteSociale, String adresse, String telephone,
        Sexe sexe
) {}
