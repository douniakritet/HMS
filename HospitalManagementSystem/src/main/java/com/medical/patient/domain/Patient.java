package com.medical.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private String nom;
    @Column(nullable = false) private String prenom;
    private LocalDate dateNaissance;

    @Enumerated(EnumType.STRING)
    private Sexe sexe;

    @Column(unique = true) private String email;
    @Column(unique = true, length = 32) private String numeroSecuriteSociale;
    private String adresse;
    private String telephone;
}
